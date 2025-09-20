import { RawData, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { AuthenticatedWebSocket, WebSocketMessage, UserInfo } from './types';
import { AuthService } from './utils/auth';
import { RoomManager } from './managers/roomManager';
import { MessageHandler } from './handler/messageHandler';
import { CONFIG } from './config';

export class ChatServer {
  private wss: WebSocketServer;
  private roomManager: RoomManager;
  private messageHandler: MessageHandler;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number = CONFIG.WS_PORT) {
    this.roomManager = new RoomManager();
    this.messageHandler = new MessageHandler(this.roomManager);
    
    this.wss = new WebSocketServer({ 
      port,
      verifyClient: AuthService.verifyClient
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    
    console.log(`🚀 WebSocket server running on port ${port}`);
    console.log(`📡 API Base URL: ${CONFIG.API_BASE_URL}`);
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage): void {
    const userInfo: UserInfo = (req as any).userInfo;

    
    
    // Initialize WebSocket properties
    ws.userId = userInfo.userId;
    ws.userType = userInfo.userType;
    ws.userName = userInfo.name;
    ws.classrooms = new Set();
    ws.isAlive = true;

    console.log(`✅ ${userInfo.userType} ${userInfo.name} connected (${ws.userId})`);

    // Setup event listeners
    ws.on('message', (data) => this.handleWebSocketMessage(ws, data, userInfo));
    ws.on('close', () => this.handleDisconnection(ws, userInfo));
    ws.on('error', (error) => this.handleError(ws, error));
    ws.on('pong', () => { ws.isAlive = true; });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      userId: ws.userId,
      userType: ws.userType,
      userName: ws.userName,
      timestamp: new Date().toISOString(),
      serverInfo: {
        rooms: this.roomManager.getRoomCount(),
        users: this.roomManager.getTotalUserCount()
      }
    }));
  }

  private async handleWebSocketMessage(
    ws: AuthenticatedWebSocket,
    data: RawData,
    userInfo: UserInfo
  ): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      await this.messageHandler.handleMessage(ws, message, userInfo);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket, userInfo: UserInfo): void {
    console.log(`❌ ${userInfo.userType} ${userInfo.name} disconnected`);
    
    // Remove from all rooms and notify other users
    ws.classrooms.forEach((roomId) => {
      this.roomManager.broadcastToRoom(roomId, {
        type: 'user_left',
        userId: ws.userId,
        userName: ws.userName,
        userType: ws.userType,
        roomId,
        timestamp: new Date().toISOString()
      });
    });
    
    this.roomManager.removeUserFromAllRooms(ws);
  }

  private handleError(ws: AuthenticatedWebSocket, error: Error): void {
    console.error(`WebSocket error for user ${ws.userName}:`, error);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, CONFIG.HEARTBEAT_INTERVAL);
  }

  public getServerStats() {
    return {
      totalConnections: this.wss.clients.size,
      totalRooms: this.roomManager.getRoomCount(),
      totalUsers: this.roomManager.getTotalUserCount(),
      rooms: this.roomManager.getRoomStats()
    };
  }

  public shutdown(): void {
    console.log('🔄 Shutting down WebSocket server...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.wss.clients.forEach((ws) => {
      ws.terminate();
    });
    
    this.wss.close(() => {
      console.log('✅ WebSocket server shut down complete');
    });
  }
}

// // Start the server
// const chatServer = new ChatServer();

// // Graceful shutdown
// process.on('SIGTERM', () => chatServer.shutdown());
// process.on('SIGINT', () => chatServer.shutdown());

export default ChatServer;