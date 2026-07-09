import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
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
    createDM(body: {
        creatorId: string;
        targetEmail: string;
    }): Promise<{
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
    createGroup(body: {
        creatorId: string;
        name: string;
        avatar?: string;
        memberEmails: string[];
    }): Promise<{
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
    updateGroup(id: string, body: {
        userId: string;
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
    addMember(id: string, body: {
        requesterId: string;
        email: string;
    }): Promise<{
        id: string;
        userId: string;
        role: string;
        joinedAt: Date;
        conversationId: string;
        lastReadAt: Date;
        isMuted: boolean;
    }>;
    removeMember(id: string, userId: string, body: {
        requesterId: string;
    }): Promise<{
        ok: boolean;
    }>;
    deleteConversation(id: string, body: {
        requesterId: string;
    }): Promise<{
        ok: boolean;
    }>;
    getMessages(id: string, userId: string, cursor?: string, limit?: string): Promise<({
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
    sendMessage(id: string, body: {
        senderId: string;
        text: string;
        replyToId?: string;
        attachments?: string;
    }): Promise<{
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
    editMessage(id: string, body: {
        userId: string;
        text: string;
    }): Promise<{
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
    deleteMessage(id: string, body: {
        userId: string;
    }): Promise<{
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
    toggleReaction(id: string, body: {
        userId: string;
        emoji: string;
    }): Promise<{
        action: string;
        messageId: string;
        userId: string;
        emoji: string;
    }>;
    markRead(id: string, body: {
        userId: string;
        lastMessageId: string;
    }): Promise<{
        ok: boolean;
    }>;
    getUnreadCounts(userId: string): Promise<Record<string, number>>;
    findUserByEmail(email: string): Promise<{
        isOnline: boolean;
        id: string;
        name: string;
        email: string | null;
        avatar: string;
    }>;
}
