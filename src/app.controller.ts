import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AppService } from './app.service';
import { uploadToCloudinary } from './cloudinary.helper';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      message: 'SyncTab Backend API is running smoothly!',
      version: '1.0.0',
      status: 'online',
    };
  }

  // ==================== USERS ====================

  @Get('users')
  getAllUsers() {
    return this.appService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: { name: string; email?: string; avatar?: string }) {
    return this.appService.createUser(body.name, body.email, body.avatar);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.appService.updateUserStatus(id, body.status);
  }

  @Patch('users/:id/settings')
  updateUserSettings(
    @Param('id') id: string,
    @Body()
    body: {
      accentColor?: string;
      blurIntensity?: string;
      clockFormat24h?: boolean;
      sidebarSettings?: string;
    },
  ) {
    return this.appService.updateUserSettings(id, body);
  }

  @Patch('users/:id/profile')
  updateUserProfile(
    @Param('id') id: string,
    @Body()
    body: { name?: string; email?: string; password?: string; avatar?: string },
  ) {
    return this.appService.updateUserProfile(id, body);
  }

  @Get('users/:id/google-accounts')
  getLinkedGoogleAccounts(@Param('id') id: string) {
    return this.appService.getLinkedGoogleAccounts(id);
  }

  @Post('users/:id/google-accounts')
  linkGoogleAccount(
    @Param('id') id: string,
    @Body()
    body: { googleEmail: string; displayName?: string; avatarUrl?: string },
  ) {
    return this.appService.linkGoogleAccount(
      id,
      body.googleEmail,
      body.displayName,
      body.avatarUrl,
    );
  }

  @Delete('users/:id/google-accounts/:googleEmail')
  unlinkGoogleAccount(
    @Param('id') id: string,
    @Param('googleEmail') googleEmail: string,
  ) {
    return this.appService.unlinkGoogleAccount(id, googleEmail);
  }

  // ==================== NOTES ====================

  @Get('notes')
  getAllNotes(@Query('userId') userId?: string) {
    return this.appService.getAllNotes(userId);
  }

  @Post('notes')
  createNote(
    @Body()
    body: {
      title: string;
      content: string;
      isShared: boolean;
      userId: string;
    },
  ) {
    return this.appService.createNote(
      body.title,
      body.content,
      body.isShared,
      body.userId,
    );
  }

  @Patch('notes/:id')
  updateNote(
    @Param('id') id: string,
    @Body()
    body: {
      title: string;
      content: string;
      isShared: boolean;
    },
  ) {
    return this.appService.updateNote(
      id,
      body.title,
      body.content,
      body.isShared,
    );
  }

  @Delete('notes/:id')
  deleteNote(@Param('id') id: string) {
    return this.appService.deleteNote(id);
  }

  // ==================== TASKS ====================

  @Get('tasks')
  getAllTasks() {
    return this.appService.getAllTasks();
  }

  @Post('tasks')
  createTask(
    @Body()
    body: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      creatorId: string;
      assigneeId?: string;
      dueDate?: string;
    },
  ) {
    return this.appService.createTask(
      body.title,
      body.description || '',
      body.status || 'TODO',
      body.priority || 'MEDIUM',
      body.creatorId,
      body.assigneeId,
      body.dueDate,
    );
  }

  @Patch('tasks/:id')
  updateTask(
    @Param('id') id: string,
    @Body() updates: Record<string, unknown>,
  ) {
    return this.appService.updateTask(id, updates);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) {
    return this.appService.deleteTask(id);
  }

  // ==================== CUSTOM WALLPAPERS ====================

  @Get('wallpapers')
  getCustomWallpapers(@Query('userId') userId: string) {
    return this.appService.getCustomWallpapers(userId);
  }

  @Post('wallpapers/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadWallpaper(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name: string; userId: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    let imageUrl = '';
    try {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        imageUrl = await uploadToCloudinary(file.buffer, file.originalname);
      } else {
        imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    } catch {
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    return this.appService.createCustomWallpaper(
      body.name,
      imageUrl,
      body.userId,
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadGenericFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    let url = '';
    try {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        url = await uploadToCloudinary(file.buffer, file.originalname);
      } else {
        url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    } catch {
      url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    return { url };
  }

  @Delete('wallpapers/:id')
  deleteCustomWallpaper(@Param('id') id: string) {
    return this.appService.deleteCustomWallpaper(id);
  }

  // ==================== BOOKMARKS ====================

  @Get('bookmarks')
  getAllBookmarks(@Query('userId') userId?: string) {
    return this.appService.getAllBookmarks(userId);
  }

  @Post('bookmarks')
  createBookmark(
    @Body()
    body: {
      title: string;
      url: string;
      category?: string;
      isShared: boolean;
      userId: string;
      position?: number;
    },
  ) {
    return this.appService.createBookmark(
      body.title,
      body.url,
      body.category || 'General',
      body.isShared,
      body.userId,
      body.position,
    );
  }

  @Patch('bookmarks/:id')
  updateBookmark(
    @Param('id') id: string,
    @Body() updates: Record<string, unknown>,
  ) {
    return this.appService.updateBookmark(id, updates);
  }

  @Delete('bookmarks/:id')
  deleteBookmark(@Param('id') id: string) {
    return this.appService.deleteBookmark(id);
  }

  @Post('bookmarks/:id/click')
  incrementBookmarkClick(@Param('id') id: string) {
    return this.appService.incrementBookmarkClick(id);
  }

  // ==================== WIDGETS ====================

  @Get('widgets')
  getWidgets(@Query('userId') userId: string, @Query('pageId') pageId: string) {
    return this.appService.getWidgets(userId, pageId);
  }

  @Post('widgets/sync')
  syncWidgets(
    @Body()
    body: {
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
    },
  ) {
    return this.appService.syncWidgets(body.userId, body.pageId, body.widgets);
  }

  // ==================== REMINDERS ====================

  @Get('reminders')
  getReminders(@Query('userId') userId: string) {
    return this.appService.getReminders(userId);
  }

  @Post('reminders')
  createReminder(
    @Body() body: { text: string; dueDate: string; userId: string },
  ) {
    return this.appService.createReminder(body.text, body.dueDate, body.userId);
  }

  @Patch('reminders/:id')
  toggleReminder(@Param('id') id: string) {
    return this.appService.toggleReminder(id);
  }

  @Delete('reminders/:id')
  deleteReminder(@Param('id') id: string) {
    return this.appService.deleteReminder(id);
  }

  // ==================== LIVE CHAT ====================

  @Get('messages')
  getMessages() {
    return this.appService.getMessages();
  }

  @Post('messages')
  createMessage(@Body() body: { text: string; userId: string }) {
    return this.appService.createMessage(body.text, body.userId);
  }

  // ==================== AUTHENTICATION ====================

  @Post('auth/login')
  login(@Body() body: { email: string; password?: string }) {
    return this.appService.login(body.email, body.password || '');
  }

  @Post('auth/register')
  register(
    @Body()
    body: {
      name: string;
      email: string;
      password?: string;
      avatar?: string;
    },
  ) {
    return this.appService.register(
      body.name,
      body.email,
      body.password || '',
      body.avatar,
    );
  }

  @Post('auth/google')
  googleLogin(
    @Body()
    body: {
      credential?: string;
      email?: string;
      name?: string;
      avatar?: string;
    },
  ) {
    return this.appService.googleLogin(body);
  }

  @Get('auth/google/login')
  googleLoginRedirect(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/auth/google/callback';
    if (!clientId) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_FAILURE',
                  error: 'GOOGLE_CLIENT_ID is not configured on the backend server.'
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h2>Configuration Error</h2><p>GOOGLE_CLIENT_ID is not configured on the backend server.</p>';
              }
            </script>
          </body>
        </html>
      `);
    }

    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' +
      encodeURIComponent(clientId) +
      '&redirect_uri=' +
      encodeURIComponent(callbackUrl) +
      '&response_type=code' +
      '&scope=openid%20profile%20email' +
      '&prompt=select_account';
    return res.redirect(url);
  }

  @Get('auth/google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!code) {
        throw new Error('Authorization code not provided by Google.');
      }
      const result = await this.appService.handleGoogleCallback(code);
      const { user, googleEmail } = result;
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  user: ${JSON.stringify(user)},
                  googleEmail: ${JSON.stringify(googleEmail)}
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h2>Authentication complete!</h2><p>You can close this window now.</p>';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_FAILURE',
                  error: ${JSON.stringify(errMsg)}
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h2>Authentication failed</h2><p>' + ${JSON.stringify(errMsg)} + '</p>';
              }
            </script>
          </body>
        </html>
      `);
    }
  }

  // ==================== ISSUE PROJECTS ====================

  @Get('issue-projects')
  getIssueProjects(@Query('userId') userId: string) {
    return this.appService.getIssueProjects(userId);
  }

  @Post('issue-projects')
  createIssueProject(
    @Body()
    body: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      ownerId: string;
    },
  ) {
    return this.appService.createIssueProject(
      body.name,
      body.description || '',
      body.icon || '🗂️',
      body.color || '#6366f1',
      body.ownerId,
    );
  }

  @Patch('issue-projects/:id')
  updateIssueProject(
    @Param('id') id: string,
    @Body()
    updates: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ) {
    return this.appService.updateIssueProject(id, updates);
  }

  @Delete('issue-projects/:id')
  deleteIssueProject(@Param('id') id: string) {
    return this.appService.deleteIssueProject(id);
  }

  @Post('issue-projects/join')
  joinProjectByToken(@Body() body: { token: string; userId: string }) {
    return this.appService.joinProjectByToken(body.token, body.userId);
  }

  @Post('issue-projects/:id/regenerate-token')
  regenerateInviteToken(@Param('id') id: string) {
    return this.appService.regenerateInviteToken(id);
  }

  @Delete('issue-projects/:projectId/members/:userId')
  removeProjectMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.appService.removeProjectMember(projectId, userId);
  }

  // ==================== ISSUES ====================

  @Get('issues')
  getIssues(
    @Query('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.appService.getIssues(projectId, status);
  }

  @Get('issues/:id')
  getIssue(@Param('id') id: string) {
    return this.appService.getIssue(id);
  }

  @Post('issues')
  createIssue(
    @Body()
    body: {
      title: string;
      description?: string;
      priority?: string;
      label?: string;
      projectId: string;
      creatorId: string;
      assigneeId?: string;
      dueDate?: string;
    },
  ) {
    return this.appService.createIssue(body);
  }

  @Patch('issues/:id')
  updateIssue(
    @Param('id') id: string,
    @Body() updates: Record<string, unknown>,
  ) {
    return this.appService.updateIssue(id, updates);
  }

  @Delete('issues/:id')
  deleteIssue(@Param('id') id: string) {
    return this.appService.deleteIssue(id);
  }

  @Post('issues/reorder')
  reorderIssues(@Body() body: { projectId: string; orderedIds: string[] }) {
    return this.appService.reorderIssues(body.projectId, body.orderedIds);
  }

  // ==================== ISSUE COMMENTS ====================

  @Get('issues/:issueId/comments')
  getIssueComments(@Param('issueId') issueId: string) {
    return this.appService.getIssueComments(issueId);
  }

  @Post('issues/:issueId/comments')
  createIssueComment(
    @Param('issueId') issueId: string,
    @Body() body: { text: string; authorId: string },
  ) {
    return this.appService.createIssueComment(
      body.text,
      issueId,
      body.authorId,
    );
  }

  @Patch('issue-comments/:id')
  updateIssueComment(@Param('id') id: string, @Body() body: { text: string }) {
    return this.appService.updateIssueComment(id, body.text);
  }

  @Delete('issue-comments/:id')
  deleteIssueComment(@Param('id') id: string) {
    return this.appService.deleteIssueComment(id);
  }
}
