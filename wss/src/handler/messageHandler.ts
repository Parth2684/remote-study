import { AuthenticatedWebSocket, WebSocketMessage, UserInfo, ChatMessage } from '../types';
import { RoomManager } from '../managers/roomManager';
import { ApiService } from '../service/apiService';
import { CONFIG } from '../config';

export class MessageHandler {
  constructor(
    private roomManager: RoomManager
  ) {}

  async handleMessage(
    ws: AuthenticatedWebSocket,
    message: WebSocketMessage,
    userInfo: UserInfo
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'join_room':
          await this.handleJoinRoom(ws, message.classroomId, userInfo);
          break;
        
        case 'leave_room':
          await this.handleLeaveRoom(ws, message.classroomId, userInfo);
          break;
        
        case 'send_message':
          await this.handleSendMessage(ws, message, userInfo);
          break;
        
        default:
          this.sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError(ws, 'Internal server error');
    }
  }

  private async handleJoinRoom(
    ws: AuthenticatedWebSocket,
    classroomId: string,
    userInfo: UserInfo
  ): Promise<void> {
    try {
      // Verify user has access to this classroom
      const hasAccess = await ApiService.verifyClassroomAccess(
        userInfo.userId,
        userInfo.userType,
        classroomId
      );
      
      if (!hasAccess) {
        this.sendError(ws, 'You do not have access to this classroom');
        return;
      }

      // Add to room
      this.roomManager.addUserToRoom(ws, classroomId);

      // Notify user they joined the room
      ws.send(JSON.stringify({
        type: 'joined_room',
        classroomId,
        message: `Joined classroom ${classroomId}`,
        users: this.roomManager.getUsersInRoom(classroomId).map(u => ({
          id: u.userId,
          name: u.userName,
          type: u.userType
        }))
      }));

      // Notify others in the room
      this.roomManager.broadcastToRoom(classroomId, {
        type: 'user_joined',
        userId: userInfo.userId,
        userName: userInfo.name,
        userType: userInfo.userType,
        classroomId,
        timestamp: new Date().toISOString()
      }, ws);

    } catch (error) {
      console.error('Error joining room:', error);
      this.sendError(ws, 'Failed to join classroom');
    }
  }

  private async handleLeaveRoom(
    ws: AuthenticatedWebSocket,
    classroomId: string,
    userInfo: UserInfo
  ): Promise<void> {
    try {
      this.roomManager.removeUserFromRoom(ws, classroomId);

      // Notify user they left the room
      ws.send(JSON.stringify({
        type: 'left_room',
        classroomId,
        message: `Left classroom ${classroomId}`
      }));

      // Notify others in the room
      this.roomManager.broadcastToRoom(classroomId, {
        type: 'user_left',
        userId: userInfo.userId,
        userName: userInfo.name,
        userType: userInfo.userType,
        classroomId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error leaving room:', error);
      this.sendError(ws, 'Failed to leave classroom');
    }
  }

  private async handleSendMessage(
    ws: AuthenticatedWebSocket,
    message: { type: 'send_message'; classroomId: string; content: string; },
    userInfo: UserInfo
  ): Promise<void> {
    try {
      // Verify user is in the room
      if (!ws.classrooms.has(message.classroomId)) {
        this.sendError(ws, 'You must join the classroom first');
        return;
      }

      // Validate message content
      if (!message.content || message.content.trim().length === 0) {
        this.sendError(ws, 'Message content cannot be empty');
        return;
      }

      if (message.content.length > CONFIG.MAX_MESSAGE_LENGTH) {
        this.sendError(ws, `Message too long. Maximum ${CONFIG.MAX_MESSAGE_LENGTH} characters allowed`);
        return;
      }

      // Save message to database
      const savedMessage = await ApiService.saveMessage({
        content: message.content.trim(),
        classroomId: message.classroomId,
        senderId: userInfo.userId,
        senderType: userInfo.userType
      });

      // Create chat message object
      const chatMessage: ChatMessage = {
        id: savedMessage.id,
        content: message.content.trim(),
        classroomId: message.classroomId,
        senderId: userInfo.userId,
        senderName: userInfo.name,
        senderType: userInfo.userType,
        timestamp: savedMessage.createdAt || new Date().toISOString()
      };

      // Broadcast message to all users in the room
      this.roomManager.broadcastToRoom(message.classroomId, {
        type: 'new_message',
        message: chatMessage
      });

    } catch (error) {
      console.error('Error sending message:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private sendError(ws: AuthenticatedWebSocket, message: string): void {
    ws.send(JSON.stringify({
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    }));
  }
}