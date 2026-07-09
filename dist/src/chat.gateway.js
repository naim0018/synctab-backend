"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("./prisma.service");
let ChatGateway = class ChatGateway {
    prisma;
    server;
    userSockets = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleConnection(client) {
        const userId = client.handshake.auth?.userId;
        if (!userId) {
            client.disconnect();
            return;
        }
        client.userId = userId;
        if (!this.userSockets.has(userId))
            this.userSockets.set(userId, new Set());
        this.userSockets.get(userId).add(client.id);
        const memberships = await this.prisma.conversationMember.findMany({
            where: { userId },
            select: { conversationId: true },
        });
        for (const m of memberships) {
            void client.join(`conv:${m.conversationId}`);
        }
        this.server.emit('user_online', { userId });
        console.log(`Chat connected: ${userId} (${client.id})`);
    }
    handleDisconnect(client) {
        const userId = client.userId;
        if (!userId)
            return;
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
    isOnline(userId) {
        return (this.userSockets.get(userId)?.size ?? 0) > 0;
    }
    handleJoin(client, data) {
        void client.join(`conv:${data.conversationId}`);
    }
    handleLeave(client, data) {
        void client.leave(`conv:${data.conversationId}`);
    }
    handleTypingStart(client, data) {
        client.to(`conv:${data.conversationId}`).emit('typing_start', { userId: client.userId, conversationId: data.conversationId });
    }
    handleTypingStop(client, data) {
        client.to(`conv:${data.conversationId}`).emit('typing_stop', { userId: client.userId, conversationId: data.conversationId });
    }
    async handleMarkRead(client, data) {
        const userId = client.userId;
        await this.prisma.conversationMember.updateMany({
            where: { conversationId: data.conversationId, userId },
            data: { lastReadAt: new Date() },
        });
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
    broadcastNewMessage(conversationId, message) {
        this.server.to(`conv:${conversationId}`).emit('new_message', message);
    }
    broadcastReaction(conversationId, reaction) {
        this.server.to(`conv:${conversationId}`).emit('reaction_updated', reaction);
    }
    broadcastMessageDeleted(conversationId, messageId) {
        this.server.to(`conv:${conversationId}`).emit('message_deleted', { messageId, conversationId });
    }
    broadcastMessageEdited(conversationId, message) {
        this.server.to(`conv:${conversationId}`).emit('message_edited', message);
    }
    broadcastConversationUpdated(conversationId, data) {
        this.server.to(`conv:${conversationId}`).emit('conversation_updated', data);
    }
    broadcastMemberAdded(conversationId, member) {
        this.server.to(`conv:${conversationId}`).emit('member_added', member);
    }
    broadcastMemberRemoved(conversationId, userId) {
        this.server.to(`conv:${conversationId}`).emit('member_removed', { conversationId, userId });
    }
    addUserToRoom(userId, conversationId) {
        const sockets = this.userSockets.get(userId);
        if (!sockets)
            return;
        for (const socketId of sockets) {
            const socket = this.server.sockets.get(socketId);
            if (socket)
                void socket.join(`conv:${conversationId}`);
        }
    }
    getOnlineUsers() {
        return [...this.userSockets.keys()];
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map