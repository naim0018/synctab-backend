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
    async getAllBookmarks(userId) {
        return this.prisma.bookmark.findMany({
            where: {
                OR: [{ isShared: true }, userId ? { userId } : { id: 'none' }],
            },
            orderBy: [{ clicks: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createBookmark(title, url, category, isShared, userId) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                title,
                url,
                category: category || 'General',
                isShared,
                userId,
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
                data: {
                    name,
                    email,
                    avatar,
                    status: 'Active',
                },
            });
        }
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
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
                data: {
                    name,
                    email,
                    avatar,
                    status: 'Active',
                },
            });
        }
        this.gateway.broadcastPresence(user.id, user.name, user.status);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_gateway_1.AppGateway])
], AppService);
//# sourceMappingURL=app.service.js.map