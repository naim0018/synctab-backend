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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const app_gateway_1 = require("./app.gateway");
const auth_helper_1 = require("./auth.helper");
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = require("crypto");
let AppService = class AppService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async createUser(name, email, avatar) {
        const userAvatar = avatar || `avatar-${Math.floor(Math.random() * 8) + 1}`;
        if (email) {
            const existing = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existing)
                return existing;
        }
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                avatar: userAvatar,
                status: 'Active',
            },
        });
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        return user;
    }
    async updateUserStatus(id, status) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { status },
        });
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        return user;
    }
    async updateUserSettings(id, settings) {
        return this.prisma.user.update({
            where: { id },
            data: settings,
        });
    }
    async getAllNotes(userId) {
        return this.prisma.note.findMany({
            where: {
                OR: [
                    { isShared: true },
                    userId ? { userId } : { id: 'none' },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async createNote(title, content, isShared, userId) {
        const note = await this.prisma.note.create({
            data: {
                title,
                content,
                isShared,
                userId,
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        if (isShared) {
            this.gateway.broadcastNoteUpdate('create', note);
        }
        return note;
    }
    async updateNote(id, title, content, isShared) {
        const note = await this.prisma.note.update({
            where: { id },
            data: { title, content, isShared },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        this.gateway.broadcastNoteUpdate('update', note);
        return note;
    }
    async deleteNote(id) {
        const note = await this.prisma.note.delete({
            where: { id },
        });
        this.gateway.broadcastNoteUpdate('delete', note);
        return note;
    }
    async getAllTasks() {
        return this.prisma.task.findMany({
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true },
                },
                creator: {
                    select: { id: true, name: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createTask(title, description, status, priority, creatorId, assigneeId, dueDate) {
        const task = await this.prisma.task.create({
            data: {
                title,
                description,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                creatorId,
                assigneeId: assigneeId || null,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true },
                },
                creator: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        this.gateway.broadcastTaskUpdate('create', task);
        return task;
    }
    async updateTask(id, updates) {
        const data = {
            ...updates,
        };
        if (updates.dueDate !== undefined) {
            data.dueDate = updates.dueDate
                ? new Date(updates.dueDate)
                : null;
        }
        const task = await this.prisma.task.update({
            where: { id },
            data,
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true },
                },
                creator: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        this.gateway.broadcastTaskUpdate('update', task);
        return task;
    }
    async deleteTask(id) {
        const task = await this.prisma.task.delete({
            where: { id },
        });
        this.gateway.broadcastTaskUpdate('delete', task);
        return task;
    }
    async getCustomWallpapers(userId) {
        return this.prisma.customWallpaper.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createCustomWallpaper(name, url, userId) {
        return this.prisma.customWallpaper.create({
            data: {
                name,
                url,
                userId,
            },
        });
    }
    async deleteCustomWallpaper(id) {
        return this.prisma.customWallpaper.delete({
            where: { id },
        });
    }
    async getAllBookmarks(userId) {
        if (!userId) {
            return this.prisma.bookmark.findMany({
                where: { isShared: true },
                orderBy: [
                    { position: 'asc' },
                    { clicks: 'desc' },
                    { createdAt: 'desc' },
                ],
            });
        }
        const linksFromUser = await this.prisma.linkedGoogleAccount.findMany({
            where: { userId },
        });
        const emailsFromUser = linksFromUser
            .map((l) => l.googleEmail)
            .filter(Boolean);
        const usersFromUserLinks = await this.prisma.user.findMany({
            where: { email: { in: emailsFromUser } },
            select: { id: true },
        });
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        const linksToUser = currentUser?.email
            ? await this.prisma.linkedGoogleAccount.findMany({
                where: { googleEmail: currentUser.email },
                select: { userId: true },
            })
            : [];
        const allUserIds = Array.from(new Set([
            userId,
            ...usersFromUserLinks.map((u) => u.id),
            ...linksToUser.map((l) => l.userId),
        ]));
        return this.prisma.bookmark.findMany({
            where: {
                OR: [{ isShared: true }, { userId: { in: allUserIds } }],
            },
            orderBy: [{ position: 'asc' }, { clicks: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createBookmark(title, url, category, isShared, userId, position) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                title,
                url,
                category: category || 'General',
                isShared,
                userId,
                position: position ?? 0,
            },
        });
        if (isShared) {
            this.gateway.broadcastBookmarkUpdate('create', bookmark);
        }
        return bookmark;
    }
    async updateBookmark(id, updates) {
        const bookmark = await this.prisma.bookmark.update({
            where: { id },
            data: updates,
        });
        this.gateway.broadcastBookmarkUpdate('update', bookmark);
        return bookmark;
    }
    async deleteBookmark(id) {
        const bookmark = await this.prisma.bookmark.delete({
            where: { id },
        });
        this.gateway.broadcastBookmarkUpdate('delete', bookmark);
        return bookmark;
    }
    async incrementBookmarkClick(id) {
        const bookmark = await this.prisma.bookmark.update({
            where: { id },
            data: {
                clicks: { increment: 1 },
            },
        });
        this.gateway.broadcastBookmarkUpdate('update', bookmark);
        return bookmark;
    }
    async getWidgets(userId, pageId) {
        const widgets = await this.prisma.widget.findMany({
            where: { userId, pageId },
            orderBy: { createdAt: 'asc' },
        });
        return widgets.map((w) => ({
            ...w,
            config: JSON.parse(w.config),
        }));
    }
    async syncWidgets(userId, pageId, widgets) {
        return this.prisma.$transaction(async (tx) => {
            await tx.widget.deleteMany({
                where: { userId, pageId },
            });
            const createdWidgets = [];
            for (const w of widgets) {
                const created = await tx.widget.create({
                    data: {
                        id: w.id,
                        type: w.type,
                        x: w.x,
                        y: w.y,
                        w: w.w,
                        h: w.h,
                        pageId,
                        config: w.config ? JSON.stringify(w.config) : '{}',
                        userId,
                    },
                });
                createdWidgets.push({
                    ...created,
                    config: JSON.parse(created.config),
                });
            }
            return createdWidgets;
        });
    }
    async getReminders(userId) {
        return this.prisma.reminder.findMany({
            where: { userId },
            orderBy: { dueDate: 'asc' },
        });
    }
    async createReminder(text, dueDate, userId) {
        return this.prisma.reminder.create({
            data: {
                text,
                dueDate: new Date(dueDate),
                userId,
            },
        });
    }
    async toggleReminder(id) {
        const reminder = await this.prisma.reminder.findUnique({
            where: { id },
        });
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        return this.prisma.reminder.update({
            where: { id },
            data: {
                isCompleted: !reminder.isCompleted,
            },
        });
    }
    async deleteReminder(id) {
        return this.prisma.reminder.delete({
            where: { id },
        });
    }
    async getMessages() {
        return this.prisma.message.findMany({
            take: 50,
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createMessage(text, userId) {
        const message = await this.prisma.message.create({
            data: {
                text,
                userId,
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        this.gateway.broadcastMessage(message);
        return message;
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            throw new common_1.NotFoundException('Invalid email or password');
        }
        const isValid = (0, auth_helper_1.verifyPassword)(password, user.password);
        if (!isValid) {
            throw new common_1.NotFoundException('Invalid email or password');
        }
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }
    async register(name, email, password, avatar) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.NotFoundException('Email is already registered');
        }
        const hashedPassword = (0, auth_helper_1.hashPassword)(password);
        const userAvatar = avatar || `avatar-${Math.floor(Math.random() * 8) + 1}`;
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                avatar: userAvatar,
                status: 'Active',
            },
        });
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }
    async verifyGoogleToken(credential) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID is not configured on the backend server.');
        }
        const client = new google_auth_library_1.OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid Google token payload.');
        }
        return {
            email: payload.email,
            name: payload.name,
            avatarUrl: payload.picture,
        };
    }
    async googleLogin(payload) {
        let email = payload.email;
        let name = payload.name;
        let avatar = payload.avatar || 'avatar-5';
        if (payload.credential) {
            try {
                const verified = await this.verifyGoogleToken(payload.credential);
                email = verified.email;
                name = verified.name;
                avatar = verified.avatarUrl || 'avatar-5';
            }
            catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error('Google token verification failed:', errMsg);
                throw new Error('Google Authentication Failed: ' + errMsg);
            }
        }
        if (!email || !name) {
            throw new Error('Missing email or name for authentication.');
        }
        const linkedAccount = await this.prisma.linkedGoogleAccount.findUnique({
            where: { googleEmail: email },
            include: { user: true },
        });
        if (linkedAccount) {
            await this.prisma.linkedGoogleAccount.update({
                where: { googleEmail: email },
                data: { displayName: name, avatarUrl: avatar },
            });
            const updateData = {};
            if (linkedAccount.user.email === email) {
                updateData.name = name;
                updateData.avatar = avatar;
            }
            const user = await this.prisma.user.update({
                where: { id: linkedAccount.userId },
                data: updateData,
            });
            this.gateway.broadcastPresence(user.id, user.name, user.status);
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            return userWithoutPassword;
        }
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { name, avatar },
            });
        }
        else {
            user = await this.prisma.user.create({
                data: { name, email, avatar, status: 'Active' },
            });
            await this.prisma.linkedGoogleAccount.create({
                data: {
                    googleEmail: email,
                    displayName: name,
                    avatarUrl: avatar,
                    userId: user.id,
                },
            });
        }
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }
    async updateUserProfile(id, updates) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        const data = {};
        if (updates.name !== undefined)
            data.name = updates.name;
        if (updates.avatar !== undefined)
            data.avatar = updates.avatar;
        if (updates.email !== undefined && updates.email !== existing.email) {
            const emailUser = await this.prisma.user.findUnique({
                where: { email: updates.email },
            });
            if (emailUser && emailUser.id !== id) {
                throw new Error('Email is already in use by another account.');
            }
            data.email = updates.email;
        }
        if (updates.password !== undefined && updates.password.trim()) {
            data.password = (0, auth_helper_1.hashPassword)(updates.password);
        }
        const user = await this.prisma.user.update({ where: { id }, data });
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }
    async getLinkedGoogleAccounts(userId) {
        return this.prisma.linkedGoogleAccount.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async linkGoogleAccount(userId, googleEmail, displayName, avatarUrl) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.prisma.linkedGoogleAccount.findUnique({
            where: { googleEmail },
            include: { user: true },
        });
        if (existing) {
            if (existing.userId === userId) {
                return this.prisma.linkedGoogleAccount.update({
                    where: { googleEmail },
                    data: { displayName, avatarUrl },
                });
            }
            const otherUser = existing.user;
            const isOAuthCreatedOrphan = otherUser.email === googleEmail && !otherUser.password;
            if (!isOAuthCreatedOrphan) {
                throw new Error('This Google account is already linked to a different SyncTab user. If you own that account, sign into it first and unlink from there.');
            }
            const updated = await this.prisma.linkedGoogleAccount.update({
                where: { googleEmail },
                data: { userId, displayName, avatarUrl },
            });
            try {
                const remainingLinks = await this.prisma.linkedGoogleAccount.count({
                    where: { userId: otherUser.id },
                });
                if (remainingLinks === 0) {
                    await this.prisma.user.delete({ where: { id: otherUser.id } });
                }
            }
            catch (_cleanupErr) {
                console.warn('Could not clean up orphaned user:', otherUser.id);
            }
            return updated;
        }
        return this.prisma.linkedGoogleAccount.create({
            data: { googleEmail, displayName, avatarUrl, userId },
        });
    }
    async unlinkGoogleAccount(userId, googleEmail) {
        const existing = await this.prisma.linkedGoogleAccount.findUnique({
            where: { googleEmail },
        });
        if (!existing || existing.userId !== userId) {
            throw new common_1.NotFoundException('Linked account not found for this user');
        }
        return this.prisma.linkedGoogleAccount.delete({ where: { googleEmail } });
    }
    async handleGoogleCallback(code) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const callbackUrl = process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:3000/auth/google/callback';
        if (!clientId || !clientSecret) {
            throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured on the backend server.');
        }
        const client = new google_auth_library_1.OAuth2Client(clientId, clientSecret, callbackUrl);
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) {
            throw new Error('Failed to retrieve ID token from Google.');
        }
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid Google token payload.');
        }
        const email = payload.email;
        const name = payload.name;
        const avatar = payload.picture || 'avatar-5';
        if (!email || !name) {
            throw new Error('Missing email or name from Google profile.');
        }
        const linkedAccount = await this.prisma.linkedGoogleAccount.findUnique({
            where: { googleEmail: email },
            include: { user: true },
        });
        if (linkedAccount) {
            await this.prisma.linkedGoogleAccount.update({
                where: { googleEmail: email },
                data: { displayName: name, avatarUrl: avatar },
            });
            const updateData = {};
            if (linkedAccount.user.email === email) {
                updateData.name = name;
                updateData.avatar = avatar;
            }
            const user = await this.prisma.user.update({
                where: { id: linkedAccount.userId },
                data: updateData,
            });
            this.gateway.broadcastPresence(user.id, user.name, user.status);
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            return { user: userWithoutPassword, googleEmail: email };
        }
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { name, avatar },
            });
        }
        else {
            user = await this.prisma.user.create({
                data: { name, email, avatar, status: 'Active' },
            });
            await this.prisma.linkedGoogleAccount.create({
                data: {
                    googleEmail: email,
                    displayName: name,
                    avatarUrl: avatar,
                    userId: user.id,
                },
            });
        }
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return { user: userWithoutPassword, googleEmail: email };
    }
    async getIssueProjects(userId) {
        const memberProjects = await this.prisma.issueProjectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });
        const projectIds = memberProjects.map((m) => m.projectId);
        return this.prisma.issueProject.findMany({
            where: {
                OR: [{ ownerId: userId }, { id: { in: projectIds } }],
            },
            include: {
                members: true,
                _count: { select: { issues: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createIssueProject(name, description, icon, color, ownerId) {
        const project = await this.prisma.issueProject.create({
            data: { name, description, icon, color, ownerId },
            include: { members: true, _count: { select: { issues: true } } },
        });
        await this.prisma.issueProjectMember.create({
            data: { projectId: project.id, userId: ownerId, role: 'owner' },
        });
        this.gateway.server.emit('issue_project_created', project);
        return project;
    }
    async updateIssueProject(id, updates) {
        const project = await this.prisma.issueProject.update({
            where: { id },
            data: updates,
            include: { members: true, _count: { select: { issues: true } } },
        });
        this.gateway.server.emit('issue_project_updated', project);
        return project;
    }
    async deleteIssueProject(id) {
        await this.prisma.issueProject.delete({ where: { id } });
        this.gateway.server.emit('issue_project_deleted', { id });
        return { id };
    }
    async joinProjectByToken(token, userId) {
        const project = await this.prisma.issueProject.findUnique({
            where: { inviteToken: token },
        });
        if (!project)
            throw new common_1.NotFoundException('Invalid invite token');
        const existing = await this.prisma.issueProjectMember.findFirst({
            where: { projectId: project.id, userId },
        });
        if (!existing) {
            await this.prisma.issueProjectMember.create({
                data: { projectId: project.id, userId, role: 'member' },
            });
        }
        return this.prisma.issueProject.findUnique({
            where: { id: project.id },
            include: { members: true, _count: { select: { issues: true } } },
        });
    }
    async regenerateInviteToken(projectId) {
        const project = await this.prisma.issueProject.update({
            where: { id: projectId },
            data: { inviteToken: (0, crypto_1.randomUUID)() },
        });
        return { inviteToken: project.inviteToken };
    }
    async removeProjectMember(projectId, userId) {
        await this.prisma.issueProjectMember.deleteMany({
            where: { projectId, userId },
        });
        this.gateway.server.emit('project_member_removed', { projectId, userId });
        return { projectId, userId };
    }
    async getIssues(projectId, status) {
        return this.prisma.issue.findMany({
            where: {
                projectId,
                ...(status ? { status } : {}),
            },
            include: {
                _count: { select: { comments: true } },
            },
            orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async getIssue(id) {
        return this.prisma.issue.findUnique({
            where: { id },
            include: {
                comments: { orderBy: { createdAt: 'asc' } },
            },
        });
    }
    async createIssue(data) {
        const count = await this.prisma.issue.count({ where: { projectId: data.projectId } });
        const issue = await this.prisma.issue.create({
            data: {
                title: data.title,
                description: data.description || '',
                priority: data.priority || 'medium',
                label: data.label || '',
                projectId: data.projectId,
                creatorId: data.creatorId,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                position: count,
                status: 'open',
            },
            include: { _count: { select: { comments: true } } },
        });
        this.gateway.server.emit('issue_created', issue);
        return issue;
    }
    async updateIssue(id, updates) {
        const data = { ...updates };
        if (updates.dueDate)
            data.dueDate = new Date(updates.dueDate);
        if (updates.status === 'done' || updates.status === 'closed') {
            data.closedAt = new Date();
        }
        else if (updates.status === 'open' || updates.status === 'in_progress') {
            data.closedAt = null;
        }
        const issue = await this.prisma.issue.update({
            where: { id },
            data,
            include: { _count: { select: { comments: true } } },
        });
        this.gateway.server.emit('issue_updated', issue);
        return issue;
    }
    async deleteIssue(id) {
        await this.prisma.issue.delete({ where: { id } });
        this.gateway.server.emit('issue_deleted', { id });
        return { id };
    }
    async reorderIssues(projectId, orderedIds) {
        await Promise.all(orderedIds.map((id, index) => this.prisma.issue.update({ where: { id }, data: { position: index } })));
        this.gateway.server.emit('issues_reordered', { projectId, orderedIds });
        return { ok: true };
    }
    async getIssueComments(issueId) {
        return this.prisma.issueComment.findMany({
            where: { issueId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createIssueComment(text, issueId, authorId) {
        const comment = await this.prisma.issueComment.create({
            data: { text, issueId, authorId },
        });
        this.gateway.server.emit('issue_comment_added', comment);
        return comment;
    }
    async updateIssueComment(id, text) {
        const comment = await this.prisma.issueComment.update({
            where: { id },
            data: { text },
        });
        this.gateway.server.emit('issue_comment_updated', comment);
        return comment;
    }
    async deleteIssueComment(id) {
        await this.prisma.issueComment.delete({ where: { id } });
        this.gateway.server.emit('issue_comment_deleted', { id });
        return { id };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_gateway_1.AppGateway])
], AppService);
//# sourceMappingURL=app.service.js.map