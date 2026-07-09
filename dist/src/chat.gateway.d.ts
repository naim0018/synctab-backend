import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './prisma.service';
interface AuthSocket extends Socket {
    userId?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    server: Server;
    private userSockets;
    constructor(prisma: PrismaService);
    handleConnection(client: AuthSocket): Promise<void>;
    handleDisconnect(client: AuthSocket): void;
    isOnline(userId: string): boolean;
    handleJoin(client: AuthSocket, data: {
        conversationId: string;
    }): void;
    handleLeave(client: AuthSocket, data: {
        conversationId: string;
    }): void;
    handleTypingStart(client: AuthSocket, data: {
        conversationId: string;
    }): void;
    handleTypingStop(client: AuthSocket, data: {
        conversationId: string;
    }): void;
    handleMarkRead(client: AuthSocket, data: {
        conversationId: string;
        lastMessageId: string;
    }): Promise<void>;
    broadcastNewMessage(conversationId: string, message: unknown): void;
    broadcastReaction(conversationId: string, reaction: unknown): void;
    broadcastMessageDeleted(conversationId: string, messageId: string): void;
    broadcastMessageEdited(conversationId: string, message: unknown): void;
    broadcastConversationUpdated(conversationId: string, data: unknown): void;
    broadcastMemberAdded(conversationId: string, member: unknown): void;
    broadcastMemberRemoved(conversationId: string, userId: string): void;
    addUserToRoom(userId: string, conversationId: string): void;
    getOnlineUsers(): string[];
}
export {};
