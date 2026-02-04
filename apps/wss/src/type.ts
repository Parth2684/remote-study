import { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  classroomId?: string;
  isAlive: boolean;
}

export interface JwtPayload {
  userId: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  email: string;
}

export interface MessagePayload {
  type: 'join' | 'message' | 'typing' | 'leave';
  classroomId?: string;
  content?: string;
  messageId?: string;
}

export interface BroadcastMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'error';
  messageId?: string;
  content?: string;
  sender?: {
    id: string;
    name: string;
    role: 'STUDENT' | 'INSTRUCTOR';
    profilePic?: string | null;
  };
  timestamp?: Date;
  classroomId?: string;
  error?: string;
}