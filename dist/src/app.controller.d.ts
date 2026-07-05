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
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
    }[]>;
    linkGoogleAccount(id: string, body: {
        googleEmail: string;
        displayName?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
    }>;
    unlinkGoogleAccount(id: string, googleEmail: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        googleEmail: string;
        displayName: string | null;
        avatarUrl: string | null;
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
        title: string;
        content: string;
        isShared: boolean;
        updatedAt: Date;
        userId: string;
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
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
    }[]>;
    uploadWallpaper(file: any, body: {
        name: string;
        userId: string;
    }): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
    }>;
    deleteCustomWallpaper(id: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
    }>;
    getAllBookmarks(userId?: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        position: number;
        clicks: number;
    }[]>;
    createBookmark(body: {
        title: string;
        url: string;
        category?: string;
        isShared: boolean;
        userId: string;
        position?: number;
    }): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        title: string;
        isShared: boolean;
        userId: string;
        category: string;
        position: number;
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
        position: number;
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
        position: number;
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
        position: number;
        clicks: number;
    }>;
    getWidgets(userId: string, pageId: string): Promise<{
        config: any;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        x: number;
        y: number;
        w: number;
        h: number;
        pageId: string;
    }[]>;
    syncWidgets(body: {
        userId: string;
        pageId: string;
        widgets: Array<{
            id: string;
            type: string;
            x: number;
            y: number;
            w: number;
            h: number;
            config?: Record<string, any>;
        }>;
    }): Promise<any[]>;
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
    getIssueProjects(userId: string): Promise<({
        _count: {
            issues: number;
        };
        members: {
            id: string;
            userId: string;
            projectId: string;
            role: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        icon: string;
        color: string;
        ownerId: string;
        inviteToken: string;
    })[]>;
    createIssueProject(body: {
        name: string;
        description?: string;
        icon?: string;
        color?: string;
        ownerId: string;
    }): Promise<{
        _count: {
            issues: number;
        };
        members: {
            id: string;
            userId: string;
            projectId: string;
            role: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        icon: string;
        color: string;
        ownerId: string;
        inviteToken: string;
    }>;
    updateIssueProject(id: string, updates: {
        name?: string;
        description?: string;
        icon?: string;
        color?: string;
    }): Promise<{
        _count: {
            issues: number;
        };
        members: {
            id: string;
            userId: string;
            projectId: string;
            role: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        icon: string;
        color: string;
        ownerId: string;
        inviteToken: string;
    }>;
    deleteIssueProject(id: string): Promise<{
        id: string;
    }>;
    joinProjectByToken(body: {
        token: string;
        userId: string;
    }): Promise<({
        _count: {
            issues: number;
        };
        members: {
            id: string;
            userId: string;
            projectId: string;
            role: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        icon: string;
        color: string;
        ownerId: string;
        inviteToken: string;
    }) | null>;
    regenerateInviteToken(id: string): Promise<{
        inviteToken: string;
    }>;
    removeProjectMember(projectId: string, userId: string): Promise<{
        projectId: string;
        userId: string;
    }>;
    getIssues(projectId: string, status?: string): Promise<({
        _count: {
            comments: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
        position: number;
        projectId: string;
        label: string;
        closedAt: Date | null;
    })[]>;
    getIssue(id: string): Promise<({
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            issueId: string;
            authorId: string;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
        position: number;
        projectId: string;
        label: string;
        closedAt: Date | null;
    }) | null>;
    createIssue(body: {
        title: string;
        description?: string;
        priority?: string;
        label?: string;
        projectId: string;
        creatorId: string;
        assigneeId?: string;
        dueDate?: string;
    }): Promise<{
        _count: {
            comments: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
        position: number;
        projectId: string;
        label: string;
        closedAt: Date | null;
    }>;
    updateIssue(id: string, updates: Record<string, unknown>): Promise<{
        _count: {
            comments: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string;
        priority: string;
        dueDate: Date | null;
        assigneeId: string | null;
        creatorId: string;
        position: number;
        projectId: string;
        label: string;
        closedAt: Date | null;
    }>;
    deleteIssue(id: string): Promise<{
        id: string;
    }>;
    reorderIssues(body: {
        projectId: string;
        orderedIds: string[];
    }): Promise<{
        ok: boolean;
    }>;
    getIssueComments(issueId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        issueId: string;
        authorId: string;
    }[]>;
    createIssueComment(issueId: string, body: {
        text: string;
        authorId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        issueId: string;
        authorId: string;
    }>;
    updateIssueComment(id: string, body: {
        text: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        issueId: string;
        authorId: string;
    }>;
    deleteIssueComment(id: string): Promise<{
        id: string;
    }>;
}
