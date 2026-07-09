import { PrismaService } from './prisma.service';
import { ChatGateway } from './chat.gateway';
export declare class ChatService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: ChatGateway);
    getConversations(userId: string): Promise<{
        myMembership: {
            conversation: {
                messages: ({
                    reactions: {
                        id: string;
                        createdAt: Date;
                        userId: string;
                        messageId: string;
                        emoji: string;
                    }[];
                    reads: {
                        userId: string;
                        readAt: Date;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    text: string;
                    conversationId: string;
                    senderId: string;
                    attachments: string;
                    replyToId: string | null;
                    isDeleted: boolean;
                    editedAt: Date | null;
                })[];
                members: {
                    userId: string;
                    role: string;
                    lastReadAt: Date;
                    isMuted: boolean;
                }[];
            } & {
                id: string;
                name: string | null;
                avatar: string | null;
                createdAt: Date;
                updatedAt: Date;
                isGroup: boolean;
                createdBy: string;
            };
        } & {
            id: string;
            userId: string;
            role: string;
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
            isMuted: boolean;
        };
        lastMessage: {
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string;
                emoji: string;
            }[];
            reads: {
                userId: string;
                readAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            conversationId: string;
            senderId: string;
            attachments: string;
            replyToId: string | null;
            isDeleted: boolean;
            editedAt: Date | null;
        };
        onlineMembers: string[];
        messages: ({
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string;
                emoji: string;
            }[];
            reads: {
                userId: string;
                readAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            conversationId: string;
            senderId: string;
            attachments: string;
            replyToId: string | null;
            isDeleted: boolean;
            editedAt: Date | null;
        })[];
        members: {
            userId: string;
            role: string;
            lastReadAt: Date;
            isMuted: boolean;
        }[];
        id: string;
        name: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        isGroup: boolean;
        createdBy: string;
    }[]>;
    createDM(creatorId: string, targetEmail: string): Promise<{
        messages: ({
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string;
                emoji: string;
            }[];
            reads: {
                userId: string;
                readAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            conversationId: string;
            senderId: string;
            attachments: string;
            replyToId: string | null;
            isDeleted: boolean;
            editedAt: Date | null;
        })[];
        members: {
            id: string;
            userId: string;
            role: string;
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
            isMuted: boolean;
        }[];
    } & {
        id: string;
        name: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        isGroup: boolean;
        createdBy: string;
    }>;
    createGroup(creatorId: string, name: string, avatar: string, memberEmails: string[]): Promise<{
        messages: ({
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string;
                emoji: string;
            }[];
            reads: {
                userId: string;
                readAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            conversationId: string;
            senderId: string;
            attachments: string;
            replyToId: string | null;
            isDeleted: boolean;
            editedAt: Date | null;
        })[];
        members: {
            id: string;
            userId: string;
            role: string;
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
            isMuted: boolean;
        }[];
    } & {
        id: string;
        name: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        isGroup: boolean;
        createdBy: string;
    }>;
    updateGroup(conversationId: string, userId: string, data: {
        name?: string;
        avatar?: string;
    }): Promise<{
        members: {
            id: string;
            userId: string;
            role: string;
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
            isMuted: boolean;
        }[];
    } & {
        id: string;
        name: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        isGroup: boolean;
        createdBy: string;
    }>;
    addMemberByEmail(conversationId: string, requesterId: string, email: string): Promise<{
        id: string;
        userId: string;
        role: string;
        joinedAt: Date;
        conversationId: string;
        lastReadAt: Date;
        isMuted: boolean;
    }>;
    removeMember(conversationId: string, requesterId: string, targetUserId: string): Promise<{
        ok: boolean;
    }>;
    deleteConversation(conversationId: string, requesterId: string): Promise<{
        ok: boolean;
    }>;
    getMessages(conversationId: string, userId: string, cursor?: string, limit?: number): Promise<({
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        reads: {
            userId: string;
            readAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        conversationId: string;
        senderId: string;
        attachments: string;
        replyToId: string | null;
        isDeleted: boolean;
        editedAt: Date | null;
    })[]>;
    sendMessage(conversationId: string, senderId: string, text: string, replyToId?: string, attachments?: string): Promise<{
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        reads: {
            userId: string;
            readAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        conversationId: string;
        senderId: string;
        attachments: string;
        replyToId: string | null;
        isDeleted: boolean;
        editedAt: Date | null;
    }>;
    editMessage(messageId: string, userId: string, text: string): Promise<{
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        reads: {
            userId: string;
            readAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        conversationId: string;
        senderId: string;
        attachments: string;
        replyToId: string | null;
        isDeleted: boolean;
        editedAt: Date | null;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        reads: {
            userId: string;
            readAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        conversationId: string;
        senderId: string;
        attachments: string;
        replyToId: string | null;
        isDeleted: boolean;
        editedAt: Date | null;
    }>;
    toggleReaction(messageId: string, userId: string, emoji: string): Promise<{
        action: string;
        messageId: string;
        userId: string;
        emoji: string;
    }>;
    markRead(conversationId: string, userId: string, lastMessageId: string): Promise<{
        ok: boolean;
    }>;
    findUserByEmail(email: string): Promise<{
        isOnline: boolean;
        id: string;
        name: string;
        email: string | null;
        avatar: string;
    }>;
    getUnreadCounts(userId: string): Promise<Record<string, number>>;
}
