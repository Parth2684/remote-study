import { WebSocket } from 'ws';


export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  userType: 'instructor' | 'student';
  userName: string;
  classrooms: Set<string>;
  isAlive: boolean
}

export interface ChatMessage {
  id: string;
  content: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  senderType: 'instructor' | 'student';
  timestamp: string;
}

export interface UserInfo {
  userId: string;
  userType: 'instructor' | 'student';
  name: string;
  email: string;
}

export interface JoinRoomMessage {
  type: 'join_room';
  classroomId: string;
}

export interface SendMessageRequest {
  type: 'send_message';
  classroomId: string;
  content: string;
}

export interface LeaveRoomMessage {
  type: 'leave_room';
  classroomId: string;
}

export type WebSocketMessage = JoinRoomMessage | SendMessageRequest | LeaveRoomMessage;

export interface WebSocketResponse {
  type: string;
  [key: string]: any;
}
