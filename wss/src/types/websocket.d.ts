import { WebSocket } from 'ws';

declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
    userId?: string;
    userType?: 'instructor' | 'student';
    userName?: string;
    classrooms?: Set<string>;
  }
}