import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppGateway } from './app.gateway';
import { Prisma } from '@prisma/client';
import { hashPassword, verifyPassword } from './auth.helper';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  // ==================== USER OPERATIONS ====================

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createUser(name: string, email?: string, avatar?: string) {
    // Generate a default visual avatar identifier if none provided
    const userAvatar = avatar || `avatar-${Math.floor(Math.random() * 8) + 1}`;

    // Check if email already exists
    if (email) {
      const existing = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existing) return existing;
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        avatar: userAvatar,
        status: 'Active',
      },
    });

    // Notify other users of a new teammate joining
    this.gateway.broadcastPresence(user.id, user.name, user.status);
    return user;
  }

  async updateUserStatus(id: string, status: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
    });
    this.gateway.broadcastPresence(user.id, user.name, user.status);
    return user;
  }

  async updateUserSettings(
    id: string,
    settings: { accentColor?: string; blurIntensity?: string; clockFormat24h?: boolean }
  ) {
    return this.prisma.user.update({
      where: { id },
      data: settings,
    });
  }

  // ==================== NOTE OPERATIONS ====================

  async getAllNotes(userId?: string) {
    return this.prisma.note.findMany({
      where: {
        OR: [
          { isShared: true },
          userId ? { userId } : { id: 'none' }, // only return user's private notes if userId is supplied
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

  async createNote(
    title: string,
    content: string,
    isShared: boolean,
    userId: string,
  ) {
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

  async updateNote(
    id: string,
    title: string,
    content: string,
    isShared: boolean,
  ) {
    const note = await this.prisma.note.update({
      where: { id },
      data: { title, content, isShared },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Broadcast if shared, or if it was previously shared (notify to sync UI)
    this.gateway.broadcastNoteUpdate('update', note);
    return note;
  }

  async deleteNote(id: string) {
    const note = await this.prisma.note.delete({
      where: { id },
    });
    this.gateway.broadcastNoteUpdate('delete', note);
    return note;
  }

  // ==================== TASK OPERATIONS ====================

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

  async createTask(
    title: string,
    description: string,
    status: string,
    priority: string,
    creatorId: string,
    assigneeId?: string,
    dueDate?: string,
  ) {
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

  async updateTask(id: string, updates: Record<string, unknown>) {
    const data: Prisma.TaskUpdateInput = {
      ...updates,
    };
    if (updates.dueDate !== undefined) {
      data.dueDate = updates.dueDate
        ? new Date(updates.dueDate as string)
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

  async deleteTask(id: string) {
    const task = await this.prisma.task.delete({
      where: { id },
    });
    this.gateway.broadcastTaskUpdate('delete', task);
    return task;
  }

  // ==================== CUSTOM WALLPAPER OPERATIONS ====================

  async getCustomWallpapers(userId: string) {
    return this.prisma.customWallpaper.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCustomWallpaper(name: string, url: string, userId: string) {
    return this.prisma.customWallpaper.create({
      data: {
        name,
        url,
        userId,
      },
    });
  }

  async deleteCustomWallpaper(id: string) {
    return this.prisma.customWallpaper.delete({
      where: { id },
    });
  }

  // ==================== BOOKMARK OPERATIONS ====================

  async getAllBookmarks(userId?: string) {
    return this.prisma.bookmark.findMany({
      where: {
        OR: [{ isShared: true }, userId ? { userId } : { id: 'none' }],
      },
      orderBy: [{ clicks: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createBookmark(
    title: string,
    url: string,
    category: string,
    isShared: boolean,
    userId: string,
  ) {
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

  async updateBookmark(id: string, updates: Record<string, unknown>) {
    const bookmark = await this.prisma.bookmark.update({
      where: { id },
      data: updates,
    });

    this.gateway.broadcastBookmarkUpdate('update', bookmark);
    return bookmark;
  }

  async deleteBookmark(id: string) {
    const bookmark = await this.prisma.bookmark.delete({
      where: { id },
    });
    this.gateway.broadcastBookmarkUpdate('delete', bookmark);
    return bookmark;
  }

  async incrementBookmarkClick(id: string) {
    const bookmark = await this.prisma.bookmark.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
      },
    });
    this.gateway.broadcastBookmarkUpdate('update', bookmark);
    return bookmark;
  }

  // ==================== REMINDER OPERATIONS ====================

  async getReminders(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createReminder(text: string, dueDate: string, userId: string) {
    return this.prisma.reminder.create({
      data: {
        text,
        dueDate: new Date(dueDate),
        userId,
      },
    });
  }

  async toggleReminder(id: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
    });
    if (!reminder) throw new NotFoundException('Reminder not found');

    return this.prisma.reminder.update({
      where: { id },
      data: {
        isCompleted: !reminder.isCompleted,
      },
    });
  }

  async deleteReminder(id: string) {
    return this.prisma.reminder.delete({
      where: { id },
    });
  }

  // ==================== LIVE CHAT OPERATIONS ====================

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

  async createMessage(text: string, userId: string) {
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

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.password) {
      throw new NotFoundException('Invalid email or password');
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      throw new NotFoundException('Invalid email or password');
    }

    // Return user without password
    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async register(
    name: string,
    email: string,
    password: string,
    avatar?: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new NotFoundException('Email is already registered');
    }

    const hashedPassword = hashPassword(password);
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

    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async verifyGoogleToken(credential: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        'GOOGLE_CLIENT_ID is not configured on the backend server.',
      );
    }

    const client = new OAuth2Client(clientId);
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

  async googleLogin(payload: {
    credential?: string;
    email?: string;
    name?: string;
    avatar?: string;
  }) {
    let email = payload.email;
    let name = payload.name;
    let avatar = payload.avatar || 'avatar-5';

    if (payload.credential) {
      try {
        const verified = await this.verifyGoogleToken(payload.credential);
        email = verified.email;
        name = verified.name;
        // Use verified profile image or default
        avatar = verified.avatarUrl || 'avatar-5';
      } catch (err: unknown) {
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
      // Update name or avatar if they changed
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name, avatar },
      });
    } else {
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

    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async handleGoogleCallback(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/auth/google/callback';

    if (!clientId || !clientSecret) {
      throw new Error(
        'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured on the backend server.',
      );
    }

    const client = new OAuth2Client(clientId, clientSecret, callbackUrl);
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
    } else {
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

    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }
}
