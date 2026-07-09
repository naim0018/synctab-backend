import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './prisma.service';

interface AuthSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: AuthSocket) {
    const userId = client.handshake.auth?.userId as string | undefined;
    if (!userId) { client.disconnect(); return; }

    client.userId = userId;
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)!.add(client.id);

    // Auto-join all user's conversation rooms
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    for (const m of memberships) {
      void client.join(`conv:${m.conversationId}`);
    }

    // Broadcast online presence
    this.server.emit('user_online', { userId });
    console.log(`Chat connected: ${userId} (${client.id})`);
  }

  handleDisconnect(client: AuthSocket) {
    const userId = client.userId;
    if (!userId) return;
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        this.server.emit('user_offline', { userId });
      }
    }
    console.log(`Chat disconnected: ${userId} (${client.id})`);
  }

  isOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  // ─── JOIN / LEAVE ─────────────────────────────────────────
  @SubscribeMessage('join_conversation')
  handleJoin(@ConnectedSocket() client: AuthSocket, @MessageBody() data: { conversationId: string }) {
    void client.join(`conv:${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(@ConnectedSocket() client: AuthSocket, @MessageBody() data: { conversationId: string }) {
    void client.leave(`conv:${data.conversationId}`);
  }

  // ─── TYPING ───────────────────────────────────────────────
  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: AuthSocket, @MessageBody() data: { conversationId: string }) {
    client.to(`conv:${data.conversationId}`).emit('typing_start', { userId: client.userId, conversationId: data.conversationId });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(@ConnectedSocket() client: AuthSocket, @MessageBody() data: { conversationId: string }) {
    client.to(`conv:${data.conversationId}`).emit('typing_stop', { userId: client.userId, conversationId: data.conversationId });
  }

  // ─── READ RECEIPT ─────────────────────────────────────────
  @SubscribeMessage('mark_read')
  async handleMarkRead(@ConnectedSocket() client: AuthSocket, @MessageBody() data: { conversationId: string; lastMessageId: string }) {
    const userId = client.userId!;
    // Update lastReadAt for member
    await this.prisma.conversationMember.updateMany({
      where: { conversationId: data.conversationId, userId },
      data: { lastReadAt: new Date() },
    });
    // Upsert read record for this specific message
    await this.prisma.messageRead.upsert({
      where: { messageId_userId: { messageId: data.lastMessageId, userId } },
      create: { messageId: data.lastMessageId, userId },
      update: { readAt: new Date() },
    });
    this.server.to(`conv:${data.conversationId}`).emit('message_read', {
      conversationId: data.conversationId,
      userId,
      lastMessageId: data.lastMessageId,
    });
  }

  // ─── BROADCAST HELPERS (called from service) ──────────────
  broadcastNewMessage(conversationId: string, message: unknown) {
    this.server.to(`conv:${conversationId}`).emit('new_message', message);
  }

  broadcastReaction(conversationId: string, reaction: unknown) {
    this.server.to(`conv:${conversationId}`).emit('reaction_updated', reaction);
  }

  broadcastMessageDeleted(conversationId: string, messageId: string) {
    this.server.to(`conv:${conversationId}`).emit('message_deleted', { messageId, conversationId });
  }

  broadcastMessageEdited(conversationId: string, message: unknown) {
    this.server.to(`conv:${conversationId}`).emit('message_edited', message);
  }

  broadcastConversationUpdated(conversationId: string, data: unknown) {
    this.server.to(`conv:${conversationId}`).emit('conversation_updated', data);
  }

  broadcastMemberAdded(conversationId: string, member: unknown) {
    this.server.to(`conv:${conversationId}`).emit('member_added', member);
  }

  broadcastMemberRemoved(conversationId: string, userId: string) {
    this.server.to(`conv:${conversationId}`).emit('member_removed', { conversationId, userId });
  }

  // Join a new user to a conversation room across all their sockets
  addUserToRoom(userId: string, conversationId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const socketId of sockets) {
      // In a namespaced gateway, this.server.sockets is the Map<socketId, Socket>
      const socket = (this.server.sockets as unknown as Map<string, Socket>).get(socketId);
      if (socket) void socket.join(`conv:${conversationId}`);
    }
  }

  getOnlineUsers(): string[] {
    return [...this.userSockets.keys()];
  }
}
