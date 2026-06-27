import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Broadcast events to all clients
  broadcastPresence(userId: string, name: string, status: string) {
    this.server.emit('presence_updated', { userId, name, status });
  }

  broadcastMessage(message: unknown) {
    this.server.emit('message_received', message);
  }

  broadcastNoteUpdate(action: string, note: unknown) {
    this.server.emit('note_updated', { action, note });
  }

  broadcastTaskUpdate(action: string, task: unknown) {
    this.server.emit('task_updated', { action, task });
  }

  broadcastBookmarkUpdate(action: string, bookmark: unknown) {
    this.server.emit('bookmark_updated', { action, bookmark });
  }
}
