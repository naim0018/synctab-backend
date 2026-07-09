import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppGateway } from './app.gateway';
import { Prisma } from '@prisma/client';
import { hashPassword, verifyPassword } from './auth.helper';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'crypto';

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
    settings: {
      accentColor?: string;
      blurIntensity?: string;
      clockFormat24h?: boolean;
      sidebarSettings?: string;
    },
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

    // 1. Find accounts linked by this user (User -> Linked Accounts)
    const linksFromUser = await this.prisma.linkedGoogleAccount.findMany({
      where: { userId },
    });
    const emailsFromUser = linksFromUser
      .map((l) => l.googleEmail)
      .filter(Boolean);

    // Find user IDs for those emails
    const usersFromUserLinks = await this.prisma.user.findMany({
      where: { email: { in: emailsFromUser } },
      select: { id: true },
    });

    // 2. Find users who have linked this user's email (Other Users -> This User)
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

    const allUserIds = Array.from(
      new Set([
        userId,
        ...usersFromUserLinks.map((u) => u.id),
        ...linksToUser.map((l) => l.userId),
      ]),
    );

    return this.prisma.bookmark.findMany({
      where: {
        OR: [{ isShared: true }, { userId: { in: allUserIds } }],
      },
      orderBy: [{ position: 'asc' }, { clicks: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createBookmark(
    title: string,
    url: string,
    category: string,
    isShared: boolean,
    userId: string,
    position?: number,
  ) {
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

  // ==================== WIDGET OPERATIONS ====================

  async getWidgets(userId: string, pageId: string) {
    const widgets = await this.prisma.widget.findMany({
      where: { userId, pageId },
      orderBy: { createdAt: 'asc' },
    });
    return widgets.map((w) => ({
      ...w,
      config: JSON.parse(w.config) as Record<string, unknown>,
    }));
  }

  async syncWidgets(
    userId: string,
    pageId: string,
    widgets: Array<{
      id: string;
      type: string;
      x: number;
      y: number;
      w: number;
      h: number;
      config?: Record<string, unknown>;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all existing widgets for this page and user
      await tx.widget.deleteMany({
        where: { userId, pageId },
      });

      // 2. Create the new widgets
      const createdWidgets: Record<string, unknown>[] = [];
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
          config: JSON.parse(created.config) as Record<string, unknown>,
        });
      }
      return createdWidgets;
    });
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

    // 1. Check if this Google email is a LINKED account
    const linkedAccount = await this.prisma.linkedGoogleAccount.findUnique({
      where: { googleEmail: email },
      include: { user: true },
    });

    if (linkedAccount) {
      await this.prisma.linkedGoogleAccount.update({
        where: { googleEmail: email },
        data: { displayName: name, avatarUrl: avatar },
      });

      // Only update primary user profile if logging in with the primary email itself
      const updateData: Prisma.UserUpdateInput = {};
      if (linkedAccount.user.email === email) {
        updateData.name = name;
        updateData.avatar = avatar;
      }

      const user = await this.prisma.user.update({
        where: { id: linkedAccount.userId },
        data: updateData,
      });
      this.gateway.broadcastPresence(user.id, user.name, user.status);
      const userWithoutPassword: Partial<typeof user> = { ...user };
      delete userWithoutPassword.password;
      return userWithoutPassword;
    }

    // 2. Primary email lookup
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
        data: { name, email, avatar, status: 'Active' },
      });
      // Auto-link this Google email
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

    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async updateUserProfile(
    id: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string;
    },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const data: Record<string, string | undefined> = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.avatar !== undefined) data.avatar = updates.avatar;
    if (updates.email !== undefined && updates.email !== existing.email) {
      // Check email uniqueness
      const emailUser = await this.prisma.user.findUnique({
        where: { email: updates.email },
      });
      if (emailUser && emailUser.id !== id) {
        throw new Error('Email is already in use by another account.');
      }
      data.email = updates.email;
    }
    if (updates.password !== undefined && updates.password.trim()) {
      data.password = hashPassword(updates.password);
    }

    const user = await this.prisma.user.update({ where: { id }, data });
    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async getLinkedGoogleAccounts(userId: string) {
    return this.prisma.linkedGoogleAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async linkGoogleAccount(
    userId: string,
    googleEmail: string,
    displayName?: string,
    avatarUrl?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if this google email is already linked somewhere
    const existing = await this.prisma.linkedGoogleAccount.findUnique({
      where: { googleEmail },
      include: { user: true },
    });

    if (existing) {
      if (existing.userId === userId) {
        // Already linked to this user — just refresh name/avatar
        return this.prisma.linkedGoogleAccount.update({
          where: { googleEmail },
          data: { displayName, avatarUrl },
        });
      }

      // Linked to a DIFFERENT user.
      // Check if that user was auto-created by the OAuth popup flow:
      //   - Their primary email equals the googleEmail (i.e. they only exist because of the OAuth redirect)
      //   - They have no password (never registered manually)
      //   - They have no data (notes, bookmarks, tasks, reminders, etc.)
      const otherUser = existing.user;
      const isOAuthCreatedOrphan =
        otherUser.email === googleEmail && !otherUser.password;

      if (!isOAuthCreatedOrphan) {
        throw new Error(
          'This Google account is already linked to a different SyncTab user. If you own that account, sign into it first and unlink from there.',
        );
      }

      // Safe to re-assign: move the link to the current user
      const updated = await this.prisma.linkedGoogleAccount.update({
        where: { googleEmail },
        data: { userId, displayName, avatarUrl },
      });

      // Clean up the now-orphaned auto-created user (they have no meaningful data)
      try {
        // Only delete if they have no other linked Google accounts and no data
        const remainingLinks = await this.prisma.linkedGoogleAccount.count({
          where: { userId: otherUser.id },
        });
        if (remainingLinks === 0) {
          await this.prisma.user.delete({ where: { id: otherUser.id } });
        }
      } catch {
        // Non-fatal: orphan cleanup failure should not block the link operation
        console.warn('Could not clean up orphaned user:', otherUser.id);
      }

      return updated;
    }

    // No existing link — create it fresh
    return this.prisma.linkedGoogleAccount.create({
      data: { googleEmail, displayName, avatarUrl, userId },
    });
  }

  async unlinkGoogleAccount(userId: string, googleEmail: string) {
    const existing = await this.prisma.linkedGoogleAccount.findUnique({
      where: { googleEmail },
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Linked account not found for this user');
    }
    return this.prisma.linkedGoogleAccount.delete({ where: { googleEmail } });
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

    // 1. Check if this Google email is a LINKED account first
    const linkedAccount = await this.prisma.linkedGoogleAccount.findUnique({
      where: { googleEmail: email },
      include: { user: true },
    });

    if (linkedAccount) {
      // Update avatar on the linked account record
      await this.prisma.linkedGoogleAccount.update({
        where: { googleEmail: email },
        data: { displayName: name, avatarUrl: avatar },
      });

      // Only update primary user profile if logging in with the primary email itself
      const updateData: Prisma.UserUpdateInput = {};
      if (linkedAccount.user.email === email) {
        updateData.name = name;
        updateData.avatar = avatar;
      }

      // Return the primary user
      const user = await this.prisma.user.update({
        where: { id: linkedAccount.userId },
        data: updateData,
      });
      this.gateway.broadcastPresence(user.id, user.name, user.status);
      const userWithoutPassword: Partial<typeof user> = { ...user };
      delete userWithoutPassword.password;
      return { user: userWithoutPassword, googleEmail: email };
    }

    // 2. Try to find by primary email
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name, avatar },
      });
    } else {
      user = await this.prisma.user.create({
        data: { name, email, avatar, status: 'Active' },
      });
      // Auto-link the primary Google email
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

    const userWithoutPassword: Partial<typeof user> = { ...user };
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, googleEmail: email };
  }

  // ==================== ISSUE PROJECTS ====================

  async getIssueProjects(userId: string) {
    // Return projects where user is owner or member
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

  async createIssueProject(
    name: string,
    description: string,
    icon: string,
    color: string,
    ownerId: string,
  ) {
    const project = await this.prisma.issueProject.create({
      data: { name, description, icon, color, ownerId },
      include: { members: true, _count: { select: { issues: true } } },
    });
    // Add owner as member with owner role
    await this.prisma.issueProjectMember.create({
      data: { projectId: project.id, userId: ownerId, role: 'owner' },
    });
    this.gateway.server.emit('issue_project_created', project);
    return project;
  }

  async updateIssueProject(
    id: string,
    updates: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ) {
    const project = await this.prisma.issueProject.update({
      where: { id },
      data: updates,
      include: { members: true, _count: { select: { issues: true } } },
    });
    this.gateway.server.emit('issue_project_updated', project);
    return project;
  }

  async deleteIssueProject(id: string) {
    await this.prisma.issueProject.delete({ where: { id } });
    this.gateway.server.emit('issue_project_deleted', { id });
    return { id };
  }

  async joinProjectByToken(token: string, userId: string) {
    const project = await this.prisma.issueProject.findUnique({
      where: { inviteToken: token },
    });
    if (!project) throw new NotFoundException('Invalid invite token');

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

  async regenerateInviteToken(projectId: string) {
    const project = await this.prisma.issueProject.update({
      where: { id: projectId },
      data: { inviteToken: randomUUID() },
    });
    return { inviteToken: project.inviteToken };
  }

  async removeProjectMember(projectId: string, userId: string) {
    await this.prisma.issueProjectMember.deleteMany({
      where: { projectId, userId },
    });
    this.gateway.server.emit('project_member_removed', { projectId, userId });
    return { projectId, userId };
  }

  // ==================== ISSUES ====================

  async getIssues(projectId: string, status?: string) {
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

  async getIssue(id: string) {
    return this.prisma.issue.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async createIssue(data: {
    title: string;
    description?: string;
    priority?: string;
    label?: string;
    projectId: string;
    creatorId: string;
    assigneeId?: string;
    dueDate?: string;
  }) {
    const count = await this.prisma.issue.count({
      where: { projectId: data.projectId },
    });
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

  async updateIssue(id: string, updates: Record<string, unknown>) {
    const data: Record<string, unknown> = { ...updates };
    if (updates.dueDate) data.dueDate = new Date(updates.dueDate as string);
    if (updates.status === 'done' || updates.status === 'closed') {
      data.closedAt = new Date();
    } else if (updates.status === 'open' || updates.status === 'in_progress') {
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

  async deleteIssue(id: string) {
    await this.prisma.issue.delete({ where: { id } });
    this.gateway.server.emit('issue_deleted', { id });
    return { id };
  }

  async reorderIssues(projectId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.prisma.issue.update({ where: { id }, data: { position: index } }),
      ),
    );
    this.gateway.server.emit('issues_reordered', { projectId, orderedIds });
    return { ok: true };
  }

  // ==================== ISSUE COMMENTS ====================

  async getIssueComments(issueId: string) {
    return this.prisma.issueComment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createIssueComment(text: string, issueId: string, authorId: string) {
    const comment = await this.prisma.issueComment.create({
      data: { text, issueId, authorId },
    });
    this.gateway.server.emit('issue_comment_added', comment);
    return comment;
  }

  async updateIssueComment(id: string, text: string) {
    const comment = await this.prisma.issueComment.update({
      where: { id },
      data: { text },
    });
    this.gateway.server.emit('issue_comment_updated', comment);
    return comment;
  }

  async deleteIssueComment(id: string) {
    await this.prisma.issueComment.delete({ where: { id } });
    this.gateway.server.emit('issue_comment_deleted', { id });
    return { id };
  }
}
