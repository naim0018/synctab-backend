import { PrismaService } from './prisma.service';
import { AppGateway } from './app.gateway';
export declare class AppService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: AppGateway);
    getAllUsers(): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }[]>;
    createUser(name: string, email?: string, avatar?: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>;
    updateUserStatus(id: string, status: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>;
    getAllNotes(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
        userId: string;
    })[]>;
    createNote(title: string, content: string, isShared: boolean, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
        userId: string;
    }>;
    updateNote(id: string, title: string, content: string, isShared: boolean): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
        userId: string;
    }>;
    deleteNote(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
        userId: string;
    }>;
    getAllTasks(): Promise<({
        assignee: {
            id: string;
            name: string;
            avatar: string;
        } | null;
        creator: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    })[]>;
    createTask(title: string, description: string, status: string, priority: string, creatorId: string, assigneeId?: string, dueDate?: string): Promise<{
        assignee: {
            id: string;
            name: string;
            avatar: string;
        } | null;
        creator: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
    updateTask(id: string, updates: Record<string, unknown>): Promise<{
        assignee: {
            id: string;
            name: string;
            avatar: string;
        } | null;
        creator: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
    deleteTask(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
    }>;
    getAllBookmarks(userId?: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        clicks: number;
    }[]>;
    createBookmark(title: string, url: string, category: string, isShared: boolean, userId: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        clicks: number;
    }>;
    updateBookmark(id: string, updates: Record<string, unknown>): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        clicks: number;
    }>;
    deleteBookmark(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        clicks: number;
    }>;
    incrementBookmarkClick(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        clicks: number;
    }>;
    getReminders(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        dueDate: Date;
        text: string;
        isCompleted: boolean;
    }[]>;
    createReminder(text: string, dueDate: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        dueDate: Date;
        text: string;
        isCompleted: boolean;
    }>;
    toggleReminder(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        dueDate: Date;
        text: string;
        isCompleted: boolean;
    }>;
    deleteReminder(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        dueDate: Date;
        text: string;
        isCompleted: boolean;
    }>;
    getMessages(): Promise<({
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        text: string;
    })[]>;
    createMessage(text: string, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        text: string;
    }>;
    login(email: string, password: string): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>>;
    register(name: string, email: string, password: string, avatar?: string): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>>;
    verifyGoogleToken(credential: string): Promise<{
        email: string | undefined;
        name: string | undefined;
        avatarUrl: string | undefined;
    }>;
    googleLogin(payload: {
        credential?: string;
        email?: string;
        name?: string;
        avatar?: string;
    }): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>>;
    handleGoogleCallback(code: string): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        createdAt: Date;
    }>>;
}
