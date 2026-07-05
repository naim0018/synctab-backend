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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_service_1 = require("./app.service");
const cloudinary_helper_1 = require("./cloudinary.helper");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getAllUsers() {
        return this.appService.getAllUsers();
    }
    createUser(body) {
        return this.appService.createUser(body.name, body.email, body.avatar);
    }
    updateUserStatus(id, body) {
        return this.appService.updateUserStatus(id, body.status);
    }
    updateUserSettings(id, body) {
        return this.appService.updateUserSettings(id, body);
    }
    updateUserProfile(id, body) {
        return this.appService.updateUserProfile(id, body);
    }
    getLinkedGoogleAccounts(id) {
        return this.appService.getLinkedGoogleAccounts(id);
    }
    linkGoogleAccount(id, body) {
        return this.appService.linkGoogleAccount(id, body.googleEmail, body.displayName, body.avatarUrl);
    }
    unlinkGoogleAccount(id, googleEmail) {
        return this.appService.unlinkGoogleAccount(id, googleEmail);
    }
    getAllNotes(userId) {
        return this.appService.getAllNotes(userId);
    }
    createNote(body) {
        return this.appService.createNote(body.title, body.content, body.isShared, body.userId);
    }
    updateNote(id, body) {
        return this.appService.updateNote(id, body.title, body.content, body.isShared);
    }
    deleteNote(id) {
        return this.appService.deleteNote(id);
    }
    getAllTasks() {
        return this.appService.getAllTasks();
    }
    createTask(body) {
        return this.appService.createTask(body.title, body.description || '', body.status || 'TODO', body.priority || 'MEDIUM', body.creatorId, body.assigneeId, body.dueDate);
    }
    updateTask(id, updates) {
        return this.appService.updateTask(id, updates);
    }
    deleteTask(id) {
        return this.appService.deleteTask(id);
    }
    getCustomWallpapers(userId) {
        return this.appService.getCustomWallpapers(userId);
    }
    async uploadWallpaper(file, body) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        let imageUrl = '';
        try {
            if (process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET) {
                imageUrl = await (0, cloudinary_helper_1.uploadToCloudinary)(file.buffer, file.originalname);
            }
            else {
                imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            }
        }
        catch (err) {
            imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }
        return this.appService.createCustomWallpaper(body.name, imageUrl, body.userId);
    }
    deleteCustomWallpaper(id) {
        return this.appService.deleteCustomWallpaper(id);
    }
    getAllBookmarks(userId) {
        return this.appService.getAllBookmarks(userId);
    }
    createBookmark(body) {
        return this.appService.createBookmark(body.title, body.url, body.category || 'General', body.isShared, body.userId, body.position);
    }
    updateBookmark(id, updates) {
        return this.appService.updateBookmark(id, updates);
    }
    deleteBookmark(id) {
        return this.appService.deleteBookmark(id);
    }
    incrementBookmarkClick(id) {
        return this.appService.incrementBookmarkClick(id);
    }
    getWidgets(userId, pageId) {
        return this.appService.getWidgets(userId, pageId);
    }
    syncWidgets(body) {
        return this.appService.syncWidgets(body.userId, body.pageId, body.widgets);
    }
    getReminders(userId) {
        return this.appService.getReminders(userId);
    }
    createReminder(body) {
        return this.appService.createReminder(body.text, body.dueDate, body.userId);
    }
    toggleReminder(id) {
        return this.appService.toggleReminder(id);
    }
    deleteReminder(id) {
        return this.appService.deleteReminder(id);
    }
    getMessages() {
        return this.appService.getMessages();
    }
    createMessage(body) {
        return this.appService.createMessage(body.text, body.userId);
    }
    login(body) {
        return this.appService.login(body.email, body.password || '');
    }
    register(body) {
        return this.appService.register(body.name, body.email, body.password || '', body.avatar);
    }
    googleLogin(body) {
        return this.appService.googleLogin(body);
    }
    googleLoginRedirect(res) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const callbackUrl = process.env.GOOGLE_CALLBACK_URL ||
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
        const url = 'https://accounts.google.com/o/oauth2/v2/auth' +
            '?client_id=' +
            encodeURIComponent(clientId) +
            '&redirect_uri=' +
            encodeURIComponent(callbackUrl) +
            '&response_type=code' +
            '&scope=openid%20profile%20email' +
            '&prompt=select_account';
        return res.redirect(url);
    }
    async googleCallback(code, res) {
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
        }
        catch (err) {
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
    getIssueProjects(userId) {
        return this.appService.getIssueProjects(userId);
    }
    createIssueProject(body) {
        return this.appService.createIssueProject(body.name, body.description || '', body.icon || '🗂️', body.color || '#6366f1', body.ownerId);
    }
    updateIssueProject(id, updates) {
        return this.appService.updateIssueProject(id, updates);
    }
    deleteIssueProject(id) {
        return this.appService.deleteIssueProject(id);
    }
    joinProjectByToken(body) {
        return this.appService.joinProjectByToken(body.token, body.userId);
    }
    regenerateInviteToken(id) {
        return this.appService.regenerateInviteToken(id);
    }
    removeProjectMember(projectId, userId) {
        return this.appService.removeProjectMember(projectId, userId);
    }
    getIssues(projectId, status) {
        return this.appService.getIssues(projectId, status);
    }
    getIssue(id) {
        return this.appService.getIssue(id);
    }
    createIssue(body) {
        return this.appService.createIssue(body);
    }
    updateIssue(id, updates) {
        return this.appService.updateIssue(id, updates);
    }
    deleteIssue(id) {
        return this.appService.deleteIssue(id);
    }
    reorderIssues(body) {
        return this.appService.reorderIssues(body.projectId, body.orderedIds);
    }
    getIssueComments(issueId) {
        return this.appService.getIssueComments(issueId);
    }
    createIssueComment(issueId, body) {
        return this.appService.createIssueComment(body.text, issueId, body.authorId);
    }
    updateIssueComment(id, body) {
        return this.appService.updateIssueComment(id, body.text);
    }
    deleteIssueComment(id) {
        return this.appService.deleteIssueComment(id);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:id/settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateUserSettings", null);
__decorate([
    (0, common_1.Patch)('users/:id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateUserProfile", null);
__decorate([
    (0, common_1.Get)('users/:id/google-accounts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getLinkedGoogleAccounts", null);
__decorate([
    (0, common_1.Post)('users/:id/google-accounts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "linkGoogleAccount", null);
__decorate([
    (0, common_1.Delete)('users/:id/google-accounts/:googleEmail'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('googleEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "unlinkGoogleAccount", null);
__decorate([
    (0, common_1.Get)('notes'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAllNotes", null);
__decorate([
    (0, common_1.Post)('notes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createNote", null);
__decorate([
    (0, common_1.Patch)('notes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Delete)('notes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Get)('tasks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAllTasks", null);
__decorate([
    (0, common_1.Post)('tasks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createTask", null);
__decorate([
    (0, common_1.Patch)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteTask", null);
__decorate([
    (0, common_1.Get)('wallpapers'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getCustomWallpapers", null);
__decorate([
    (0, common_1.Post)('wallpapers/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "uploadWallpaper", null);
__decorate([
    (0, common_1.Delete)('wallpapers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteCustomWallpaper", null);
__decorate([
    (0, common_1.Get)('bookmarks'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAllBookmarks", null);
__decorate([
    (0, common_1.Post)('bookmarks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createBookmark", null);
__decorate([
    (0, common_1.Patch)('bookmarks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateBookmark", null);
__decorate([
    (0, common_1.Delete)('bookmarks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteBookmark", null);
__decorate([
    (0, common_1.Post)('bookmarks/:id/click'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "incrementBookmarkClick", null);
__decorate([
    (0, common_1.Get)('widgets'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('pageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getWidgets", null);
__decorate([
    (0, common_1.Post)('widgets/sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "syncWidgets", null);
__decorate([
    (0, common_1.Get)('reminders'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getReminders", null);
__decorate([
    (0, common_1.Post)('reminders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createReminder", null);
__decorate([
    (0, common_1.Patch)('reminders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "toggleReminder", null);
__decorate([
    (0, common_1.Delete)('reminders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteReminder", null);
__decorate([
    (0, common_1.Get)('messages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('auth/google'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('auth/google/login'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "googleLoginRedirect", null);
__decorate([
    (0, common_1.Get)('auth/google/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('issue-projects'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getIssueProjects", null);
__decorate([
    (0, common_1.Post)('issue-projects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createIssueProject", null);
__decorate([
    (0, common_1.Patch)('issue-projects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateIssueProject", null);
__decorate([
    (0, common_1.Delete)('issue-projects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteIssueProject", null);
__decorate([
    (0, common_1.Post)('issue-projects/join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "joinProjectByToken", null);
__decorate([
    (0, common_1.Post)('issue-projects/:id/regenerate-token'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "regenerateInviteToken", null);
__decorate([
    (0, common_1.Delete)('issue-projects/:projectId/members/:userId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "removeProjectMember", null);
__decorate([
    (0, common_1.Get)('issues'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getIssues", null);
__decorate([
    (0, common_1.Get)('issues/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getIssue", null);
__decorate([
    (0, common_1.Post)('issues'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createIssue", null);
__decorate([
    (0, common_1.Patch)('issues/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateIssue", null);
__decorate([
    (0, common_1.Delete)('issues/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteIssue", null);
__decorate([
    (0, common_1.Post)('issues/reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "reorderIssues", null);
__decorate([
    (0, common_1.Get)('issues/:issueId/comments'),
    __param(0, (0, common_1.Param)('issueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getIssueComments", null);
__decorate([
    (0, common_1.Post)('issues/:issueId/comments'),
    __param(0, (0, common_1.Param)('issueId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createIssueComment", null);
__decorate([
    (0, common_1.Patch)('issue-comments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateIssueComment", null);
__decorate([
    (0, common_1.Delete)('issue-comments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteIssueComment", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map