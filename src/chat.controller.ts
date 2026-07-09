import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── CONVERSATIONS ────────────────────────────────────────

  @Get('conversations')
  getConversations(@Query('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Post('conversations/dm')
  createDM(@Body() body: { creatorId: string; targetEmail: string }) {
    return this.chatService.createDM(body.creatorId, body.targetEmail);
  }

  @Post('conversations/group')
  createGroup(@Body() body: { creatorId: string; name: string; avatar?: string; memberEmails: string[] }) {
    return this.chatService.createGroup(body.creatorId, body.name, body.avatar ?? '💬', body.memberEmails ?? []);
  }

  @Patch('conversations/:id')
  updateGroup(
    @Param('id') id: string,
    @Body() body: { userId: string; name?: string; avatar?: string },
  ) {
    return this.chatService.updateGroup(id, body.userId, { name: body.name, avatar: body.avatar });
  }

  @Post('conversations/:id/members')
  addMember(
    @Param('id') id: string,
    @Body() body: { requesterId: string; email: string },
  ) {
    return this.chatService.addMemberByEmail(id, body.requesterId, body.email);
  }

  @Delete('conversations/:id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { requesterId: string },
  ) {
    return this.chatService.removeMember(id, body.requesterId, userId);
  }

  @Delete('conversations/:id')
  deleteConversation(
    @Param('id') id: string,
    @Body() body: { requesterId: string },
  ) {
    return this.chatService.deleteConversation(id, body.requesterId);
  }

  // ─── MESSAGES ─────────────────────────────────────────────

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(id, userId, cursor, limit ? parseInt(limit) : 40);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; text: string; replyToId?: string; attachments?: string },
  ) {
    return this.chatService.sendMessage(id, body.senderId, body.text, body.replyToId, body.attachments);
  }

  @Patch('messages/:id')
  editMessage(
    @Param('id') id: string,
    @Body() body: { userId: string; text: string },
  ) {
    return this.chatService.editMessage(id, body.userId, body.text);
  }

  @Delete('messages/:id')
  deleteMessage(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return this.chatService.deleteMessage(id, body.userId);
  }

  // ─── REACTIONS ────────────────────────────────────────────

  @Post('messages/:id/reactions')
  toggleReaction(
    @Param('id') id: string,
    @Body() body: { userId: string; emoji: string },
  ) {
    return this.chatService.toggleReaction(id, body.userId, body.emoji);
  }

  // ─── READ ─────────────────────────────────────────────────

  @Post('conversations/:id/read')
  markRead(
    @Param('id') id: string,
    @Body() body: { userId: string; lastMessageId: string },
  ) {
    return this.chatService.markRead(id, body.userId, body.lastMessageId);
  }

  @Get('unread')
  getUnreadCounts(@Query('userId') userId: string) {
    return this.chatService.getUnreadCounts(userId);
  }

  // ─── LOOKUP ───────────────────────────────────────────────

  @Get('users/find')
  findUserByEmail(@Query('email') email: string) {
    return this.chatService.findUserByEmail(email);
  }
}
