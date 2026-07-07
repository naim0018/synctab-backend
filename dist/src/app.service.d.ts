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
    getCustomWallpapers(userId: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        userId: string;
    }[]>;
    createCustomWallpaper(name: string, url: string, userId: string): Promise<{
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
    createBookmark(title: string, url: string, category: string, isShared: boolean, userId: string, position?: number): Promise<{
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
        config: Record<string, unknown>;
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
    syncWidgets(userId: string, pageId: string, widgets: Array<{
        id: string;
        type: string;
        x: number;
        y: number;
        w: number;
        h: number;
        config?: Record<string, unknown>;
    }>): Promise<Record<string, unknown>[]>;
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
    createIssueProject(name: string, description: string, icon: string, color: string, ownerId: string): Promise<{
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
    joinProjectByToken(token: string, userId: string): Promise<({
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
    regenerateInviteToken(projectId: string): Promise<{
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
    createIssue(data: {
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
    reorderIssues(projectId: string, orderedIds: string[]): Promise<{
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
    createIssueComment(text: string, issueId: string, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        issueId: string;
        authorId: string;
    }>;
    updateIssueComment(id: string, text: string): Promise<{
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
