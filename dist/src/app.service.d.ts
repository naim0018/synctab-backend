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
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }[]>;
    createUser(name: string, email?: string, avatar?: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }>;
    updateUserStatus(id: string, status: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }>;
    updateUserSettings(id: string, settings: {
        accentColor?: string;
        blurIntensity?: string;
        clockFormat24h?: boolean;
    }): Promise<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
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
        userId: string;
        updatedAt: Date;
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
        userId: string;
        updatedAt: Date;
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
        userId: string;
        updatedAt: Date;
    }>;
    deleteNote(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        isShared: boolean;
        userId: string;
        updatedAt: Date;
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
    getCustomWallpapers(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
        url: string;
    }[]>;
    createCustomWallpaper(name: string, url: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
        url: string;
    }>;
    deleteCustomWallpaper(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
        url: string;
    }>;
    getAllBookmarks(userId?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        url: string;
        category: string;
        clicks: number;
    }[]>;
    createBookmark(title: string, url: string, category: string, isShared: boolean, userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        url: string;
        category: string;
        clicks: number;
    }>;
    updateBookmark(id: string, updates: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        url: string;
        category: string;
        clicks: number;
    }>;
    deleteBookmark(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        url: string;
        category: string;
        clicks: number;
    }>;
    incrementBookmarkClick(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        url: string;
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
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }>>;
    register(name: string, email: string, password: string, avatar?: string): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
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
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }>>;
    updateUserProfile(id: string, updates: {
        name?: string;
        email?: string;
        password?: string;
        avatar?: string;
    }): Promise<Partial<{
        id: string;
        name: string;
        email: string | null;
        password: string | null;
        avatar: string;
        status: string;
        accentColor: string;
        blurIntensity: string;
        clockFormat24h: boolean;
        createdAt: Date;
    }>>;
    getLinkedGoogleAccounts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
    }[]>;
    linkGoogleAccount(userId: string, googleEmail: string, displayName?: string, avatarUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
    }>;
    unlinkGoogleAccount(userId: string, googleEmail: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
    }>;
    handleGoogleCallback(code: string): Promise<{
        user: Partial<{
            id: string;
            name: string;
            email: string | null;
            password: string | null;
            avatar: string;
            status: string;
            accentColor: string;
            blurIntensity: string;
            clockFormat24h: boolean;
            createdAt: Date;
        }>;
        googleEmail: string;
    }>;
}
