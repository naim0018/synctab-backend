import { Response } from 'express';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
    createUser(body: {
        name: string;
        email?: string;
        avatar?: string;
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
    updateUserStatus(id: string, body: {
        status: string;
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
    updateUserSettings(id: string, body: {
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
    updateUserProfile(id: string, body: {
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
    getLinkedGoogleAccounts(id: string): Promise<{
        id: string;
        createdAt: Date;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
        userId: string;
    }[]>;
    linkGoogleAccount(id: string, body: {
        googleEmail: string;
        displayName?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
        userId: string;
    }>;
    unlinkGoogleAccount(id: string, googleEmail: string): Promise<{
        id: string;
        createdAt: Date;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
        userId: string;
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
        userId: string;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
    })[]>;
    createNote(body: {
        title: string;
        content: string;
        isShared: boolean;
        userId: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
    }>;
    updateNote(id: string, body: {
        title: string;
        content: string;
        isShared: boolean;
    }): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
    }>;
    deleteNote(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        content: string;
        isShared: boolean;
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
    createTask(body: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        creatorId: string;
        assigneeId?: string;
        dueDate?: string;
    }): Promise<{
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
    uploadWallpaper(file: any, body: {
        name: string;
        userId: string;
    }): Promise<{
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
        userId: string;
        title: string;
        isShared: boolean;
        url: string;
        category: string;
        clicks: number;
    }[]>;
    createBookmark(body: {
        title: string;
        url: string;
        category?: string;
        isShared: boolean;
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        isShared: boolean;
        url: string;
        category: string;
        clicks: number;
    }>;
    updateBookmark(id: string, updates: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        isShared: boolean;
        url: string;
        category: string;
        clicks: number;
    }>;
    deleteBookmark(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        isShared: boolean;
        url: string;
        category: string;
        clicks: number;
    }>;
    incrementBookmarkClick(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        isShared: boolean;
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
    createReminder(body: {
        text: string;
        dueDate: string;
        userId: string;
    }): Promise<{
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
    createMessage(body: {
        text: string;
        userId: string;
    }): Promise<{
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
    login(body: {
        email: string;
        password?: string;
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
    register(body: {
        name: string;
        email: string;
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
    googleLogin(body: {
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
    googleLoginRedirect(res: Response): void | Response<any, Record<string, any>>;
    googleCallback(code: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
