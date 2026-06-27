import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastPresence(userId: string, name: string, status: string): void;
    broadcastMessage(message: unknown): void;
    broadcastNoteUpdate(action: string, note: unknown): void;
    broadcastTaskUpdate(action: string, task: unknown): void;
    broadcastBookmarkUpdate(action: string, bookmark: unknown): void;
}
