import { AuthenticatedWebSocket, WebSocketResponse } from '../types';
import { WebSocket } from 'ws';


export class RoomManager {
  private rooms: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  addUserToRoom(ws: AuthenticatedWebSocket, roomId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId)!.add(ws);
    ws.classrooms.add(roomId);
    
    console.log(`User ${ws.userName} joined room ${roomId}`);
  }

  removeUserFromRoom(ws: AuthenticatedWebSocket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws);
      ws.classrooms.delete(roomId);
      
      if (room.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (no users left)`);
      }
      
      console.log(`User ${ws.userName} left room ${roomId}`);
    }
  }

  removeUserFromAllRooms(ws: AuthenticatedWebSocket): void {
    ws.classrooms.forEach((roomId) => {
      this.removeUserFromRoom(ws, roomId);
    });
  }

  broadcastToRoom(roomId: string, message: WebSocketResponse, exclude?: AuthenticatedWebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(`Attempted to broadcast to non-existent room: ${roomId}`);
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    room.forEach((client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`Error sending message to client in room ${roomId}:`, error);
          // Remove dead connection
          room.delete(client);
        }
      }
    });

    console.log(`Broadcasted message to ${sentCount} users in room ${roomId}`);
  }

  getUsersInRoom(roomId: string): AuthenticatedWebSocket[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getTotalUserCount(): number {
    let total = 0;
    this.rooms.forEach(room => {
      total += room.size;
    });
    return total;
  }

  getRoomStats(): { roomId: string; userCount: number; users: string[] }[] {
    const stats: { roomId: string; userCount: number; users: string[] }[] = [];
    
    this.rooms.forEach((users, roomId) => {
      stats.push({
        roomId,
        userCount: users.size,
        users: Array.from(users).map(ws => ws.userName)
      });
    });
    
    return stats;
  }
}