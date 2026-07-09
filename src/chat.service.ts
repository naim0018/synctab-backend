import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ChatGateway } from './chat.gateway';

const MSG_INCLUDE = {
  reactions: true,
  reads: { select: { userId: true, readAt: true } },
} as const;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ChatGateway,
  ) {}

  // ─── CONVERSATIONS ────────────────────────────────────────

  async getConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: { select: { userId: true, role: true, lastReadAt: true, isMuted: true } },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: MSG_INCLUDE,
            },
          },
        },
      },
    });

    const onlineUsers = this.gateway.getOnlineUsers();

    return memberships.map((m) => {
      const conv = m.conversation;
      const lastMsg = conv.messages[0] ?? null;
      // unread count = messages after lastReadAt
      return {
        ...conv,
        myMembership: m,
        lastMessage: lastMsg,
        onlineMembers: conv.members.filter((mb) => onlineUsers.includes(mb.userId)).map((mb) => mb.userId),
      };
    });
  }

  async createDM(creatorId: string, targetEmail: string) {
    const target = await this.prisma.user.findUnique({ where: { email: targetEmail } });
    if (!target) throw new NotFoundException(`No user found with email ${targetEmail}`);
    if (target.id === creatorId) throw new ForbiddenException('Cannot DM yourself');

    // Check if DM already exists
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: { every: { userId: { in: [creatorId, target.id] } } },
        AND: [
          { members: { some: { userId: creatorId } } },
          { members: { some: { userId: target.id } } },
        ],
      },
      include: { members: true, messages: { take: 1, orderBy: { createdAt: 'desc' }, include: MSG_INCLUDE } },
    });
    if (existing) return existing;

    const conv = await this.prisma.conversation.create({
      data: {
        isGroup: false,
        createdBy: creatorId,
        members: {
          create: [
            { userId: creatorId, role: 'owner' },
            { userId: target.id, role: 'member' },
          ],
        },
      },
      include: { members: true, messages: { take: 1, include: MSG_INCLUDE } },
    });

    this.gateway.addUserToRoom(creatorId, conv.id);
    this.gateway.addUserToRoom(target.id, conv.id);
    this.gateway.broadcastConversationUpdated(conv.id, conv);
    return conv;
  }

  async createGroup(creatorId: string, name: string, avatar: string, memberEmails: string[]) {
    const users = await this.prisma.user.findMany({ where: { email: { in: memberEmails } } });
    const memberIds = [...new Set([creatorId, ...users.map((u) => u.id)])];

    const conv = await this.prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        avatar: avatar || '💬',
        createdBy: creatorId,
        members: {
          create: memberIds.map((uid) => ({
            userId: uid,
            role: uid === creatorId ? 'owner' : 'member',
          })),
        },
      },
      include: { members: true, messages: { take: 1, include: MSG_INCLUDE } },
    });

    for (const uid of memberIds) {
      this.gateway.addUserToRoom(uid, conv.id);
    }
    this.gateway.broadcastConversationUpdated(conv.id, conv);
    return conv;
  }

  async updateGroup(conversationId: string, userId: string, data: { name?: string; avatar?: string }) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member || member.role === 'member') throw new ForbiddenException('Only admins/owners can update group');

    const conv = await this.prisma.conversation.update({
      where: { id: conversationId },
      data,
      include: { members: true },
    });
    this.gateway.broadcastConversationUpdated(conversationId, conv);
    return conv;
  }

  async addMemberByEmail(conversationId: string, requesterId: string, email: string) {
    const target = await this.prisma.user.findUnique({ where: { email } });
    if (!target) throw new NotFoundException(`No user found with email ${email}`);

    const newMember = await this.prisma.conversationMember.upsert({
      where: { conversationId_userId: { conversationId, userId: target.id } },
      create: { conversationId, userId: target.id, role: 'member' },
      update: {},
    });
    this.gateway.addUserToRoom(target.id, conversationId);
    this.gateway.broadcastMemberAdded(conversationId, { ...newMember, user: target });
    return newMember;
  }

  async removeMember(conversationId: string, requesterId: string, targetUserId: string) {
    const requester = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId: requesterId } },
    });
    if (!requester || (requester.role === 'member' && requesterId !== targetUserId)) {
      throw new ForbiddenException('Not authorized');
    }
    await this.prisma.conversationMember.deleteMany({
      where: { conversationId, userId: targetUserId },
    });
    this.gateway.broadcastMemberRemoved(conversationId, targetUserId);
    return { ok: true };
  }

  async deleteConversation(conversationId: string, requesterId: string) {
    const requester = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId: requesterId } },
    });
    if (!requester || requester.role === 'member') {
      throw new ForbiddenException('Only owner or admin can delete the conversation');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    // Notify clients to remove this conversation from their lists
    this.gateway.broadcastConversationUpdated(conversationId, { id: conversationId, isDeleted: true });
    return { ok: true };
  }

  // ─── MESSAGES ─────────────────────────────────────────────

  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 40) {
    // Verify membership
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member');

    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: MSG_INCLUDE,
    });
    return messages.reverse();
  }

  async sendMessage(conversationId: string, senderId: string, text: string, replyToId?: string, attachments: string = '[]') {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!member) throw new ForbiddenException('Not a member');

    const msg = await this.prisma.chatMessage.create({
      data: { conversationId, senderId, text, replyToId, attachments },
      include: { ...MSG_INCLUDE },
    });

    // Auto-mark as read for sender
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId: senderId } },
      data: { lastReadAt: new Date() },
    });

    this.gateway.broadcastNewMessage(conversationId, msg);
    return msg;
  }

  async editMessage(messageId: string, userId: string, text: string) {
    const msg = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== userId) throw new ForbiddenException('Cannot edit others messages');

    const updated = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { text, editedAt: new Date() },
      include: MSG_INCLUDE,
    });
    this.gateway.broadcastMessageEdited(msg.conversationId, updated);
    return updated;
  }

  async deleteMessage(messageId: string, userId: string) {
    const msg = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== userId) throw new ForbiddenException('Cannot delete others messages');

    const deleted = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, text: 'This message was deleted' },
      include: MSG_INCLUDE,
    });
    this.gateway.broadcastMessageDeleted(msg.conversationId, messageId);
    return deleted;
  }

  // ─── REACTIONS ────────────────────────────────────────────

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const msg = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    const existing = await this.prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });

    let result: { action: string; messageId: string; userId: string; emoji: string };
    if (existing) {
      await this.prisma.messageReaction.delete({ where: { id: existing.id } });
      result = { action: 'removed', messageId, userId, emoji };
    } else {
      await this.prisma.messageReaction.create({ data: { messageId, userId, emoji } });
      result = { action: 'added', messageId, userId, emoji };
    }
    this.gateway.broadcastReaction(msg.conversationId, result);
    return result;
  }

  // ─── MARK READ ────────────────────────────────────────────

  async markRead(conversationId: string, userId: string, lastMessageId: string) {
    await this.prisma.conversationMember.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });
    await this.prisma.messageRead.upsert({
      where: { messageId_userId: { messageId: lastMessageId, userId } },
      create: { messageId: lastMessageId, userId },
      update: { readAt: new Date() },
    });
    return { ok: true };
  }

  // ─── LOOKUP ───────────────────────────────────────────────

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, avatar: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, isOnline: this.gateway.isOnline(user.id) };
  }

  async getUnreadCounts(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });
    const counts: Record<string, number> = {};
    for (const m of memberships) {
      const count = await this.prisma.chatMessage.count({
        where: {
          conversationId: m.conversationId,
          createdAt: { gt: m.lastReadAt },
          senderId: { not: userId },
          isDeleted: false,
        },
      });
      counts[m.conversationId] = count;
    }
    return counts;
  }
}
