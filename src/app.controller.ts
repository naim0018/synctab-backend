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
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
    },
  ) {
    return this.appService.createBookmark(
      body.title,
      body.url,
      body.category || 'General',
      body.isShared,
      body.userId,
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
      const user = (await this.appService.handleGoogleCallback(code)) as Record<
        string,
        unknown
      >;
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  user: ${JSON.stringify(user)}
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
}
