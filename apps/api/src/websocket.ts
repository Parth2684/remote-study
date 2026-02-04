import type { WebSocket as WSWebSocket, WebSocketServer as WSWebSocketServer } from 'ws';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { prisma } from '@repo/db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/export';

const classroomConnections = new Map<string, Set<WebSocket & { userId: string; userName: string; role: string }>>();

interface AuthPayload {
  id: string;
  email: string;
  role: 'INSTRUCTOR' | 'STUDENT';
  name: string;
}

interface WebSocketMessage {
  type: 'auth' | 'send_message' | 'get_history' | 'delete_message' | 'edit_message';
  token?: string;
  classId?: string;
  content?: string;
  messageId?: string;
  userId?: string;
}

function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

function extractTokenFromCookies(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value ?? '';
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['authToken'] || null;
}

function extractTokenFromUrl(url: string): string | null {
  const parsedUrl = parse(url, true);
  return parsedUrl.query.token as string || null;
}

async function checkClassroomAccess(classroomId: string, userId: string, role: string): Promise<boolean> {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: {
      students: { where: { studentId: userId } },
      instructor: true
    }
  });

  if (!classroom) return false;

  if (role === 'INSTRUCTOR') {
    return classroom.instructorId === userId;
  } else {
    return classroom.students.length > 0;
  }
}

function broadcastToClassroom(classroomId: string, message: any, excludeWs?: WebSocket) {
  const connections = classroomConnections.get(classroomId);
  if (!connections) return;

  const messageStr = JSON.stringify(message);
  connections.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function sendToClient(ws: WebSocket, message: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

async function getMessageHistory(classroomId: string, limit: number = 50) {
  const messages = await prisma.message.findMany({
    where: {
      classroomId,
      isDeleted: false
    },
    include: {
      instructor: {
        select: { id: true, name: true, profilePic: true }
      },
      student: {
        select: { id: true, name: true, profilePic: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return messages.reverse().map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    isEdited: msg.isEdited,
    userId: msg.instructorId || msg.studentId,
    userName: msg.instructor?.name || msg.student?.name,
    userProfilePic: msg.instructor?.profilePic || msg.student?.profilePic,
    role: msg.instructorId ? 'INSTRUCTOR' : 'STUDENT'
  }));
}

export function createWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocket & { userId?: string; userName?: string; role?: string; classroomId?: string }, req: IncomingMessage) => {
    console.log('New WebSocket connection');

    const url = req.url || '';
    const classroomMatch = url.match(/\/classroom\/([^?]+)/);
    const classroomId = classroomMatch ? classroomMatch[1] : null;

    const cookieToken = extractTokenFromCookies(req.headers.cookie);
    
    const urlToken = extractTokenFromUrl(url);
    
    const token = cookieToken || urlToken;
    
    let authenticated = false;
    let authPayload: AuthPayload | null = null;

    if (token && classroomId) {
      authPayload = verifyToken(token);
      if (authPayload) {
        const hasAccess = await checkClassroomAccess(classroomId, authPayload.id, authPayload.role);
        if (hasAccess) {
          authenticated = true;
          ws.userId = authPayload.id;
          ws.userName = authPayload.name;
          ws.role = authPayload.role;
          ws.classroomId = classroomId;

          if (!classroomConnections.has(classroomId)) {
            classroomConnections.set(classroomId, new Set());
          }
          classroomConnections.get(classroomId)!.add(ws as any);

          sendToClient(ws, {
            type: 'auth_success',
            userId: authPayload.id,
            userName: authPayload.name,
            role: authPayload.role
          });

          const history = await getMessageHistory(classroomId);
          sendToClient(ws, {
            type: 'message_history',
            messages: history
          });

          console.log(`User ${authPayload.name} (${authPayload.role}) joined classroom ${classroomId}`);
        } else {
          sendToClient(ws, { type: 'error', message: 'Access denied to classroom' });
          ws.close();
          return;
        }
      } else {
        sendToClient(ws, { type: 'error', message: 'Invalid or expired token' });
        ws.close();
        return;
      }
    } else {
      sendToClient(ws, { type: 'error', message: 'Authentication required' });
      ws.close();
      return;
    }

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        if (!authenticated || !ws.userId || !ws.classroomId) {
          sendToClient(ws, { type: 'error', message: 'Not authenticated' });
          return;
        }

        switch (message.type) {
          case 'send_message':
            if (!message.content?.trim()) {
              sendToClient(ws, { type: 'error', message: 'Message content is required' });
              return;
            }

            if (message.content.trim().length > 2000) {
              sendToClient(ws, { type: 'error', message: 'Message too long (max 2000 characters)' });
              return;
            }

            const newMessage = await prisma.message.create({
              data: {
                content: message.content.trim(),
                classroomId: ws.classroomId,
                ...(ws.role === 'INSTRUCTOR' 
                  ? { instructorId: ws.userId }
                  : { studentId: ws.userId }
                )
              },
              include: {
                instructor: {
                  select: { id: true, name: true, profilePic: true }
                },
                student: {
                  select: { id: true, name: true, profilePic: true }
                }
              }
            });

            const broadcastMessage = {
              type: 'new_message',
              id: newMessage.id,
              content: newMessage.content,
              createdAt: newMessage.createdAt.toISOString(),
              isEdited: newMessage.isEdited,
              userId: newMessage.instructorId || newMessage.studentId,
              userName: newMessage.instructor?.name || newMessage.student?.name,
              userProfilePic: newMessage.instructor?.profilePic || newMessage.student?.profilePic,
              role: newMessage.instructorId ? 'INSTRUCTOR' : 'STUDENT'
            };

            broadcastToClassroom(ws.classroomId, broadcastMessage);
            break;

          case 'get_history':
            const history = await getMessageHistory(ws.classroomId);
            sendToClient(ws, {
              type: 'message_history',
              messages: history
            });
            break;

          case 'delete_message':
            if (!message.messageId) {
              sendToClient(ws, { type: 'error', message: 'Message ID is required' });
              return;
            }

            const messageToDelete = await prisma.message.findUnique({
              where: { id: message.messageId }
            });

            if (!messageToDelete) {
              sendToClient(ws, { type: 'error', message: 'Message not found' });
              return;
            }

            const canDelete = 
              (ws.role === 'INSTRUCTOR' && messageToDelete.instructorId === ws.userId) ||
              (ws.role === 'STUDENT' && messageToDelete.studentId === ws.userId) ||
              (ws.role === 'INSTRUCTOR'); 

            if (!canDelete) {
              sendToClient(ws, { type: 'error', message: 'Permission denied' });
              return;
            }

            await prisma.message.update({
              where: { id: message.messageId },
              data: { isDeleted: true }
            });

            broadcastToClassroom(ws.classroomId, {
              type: 'delete_message',
              messageId: message.messageId
            });
            break;

          case 'edit_message':
            if (!message.messageId || !message.content?.trim()) {
              sendToClient(ws, { type: 'error', message: 'Message ID and content are required' });
              return;
            }

            const messageToEdit = await prisma.message.findUnique({
              where: { id: message.messageId }
            });

            if (!messageToEdit) {
              sendToClient(ws, { type: 'error', message: 'Message not found' });
              return;
            }

            const canEdit = 
              (ws.role === 'INSTRUCTOR' && messageToEdit.instructorId === ws.userId) ||
              (ws.role === 'STUDENT' && messageToEdit.studentId === ws.userId);

            if (!canEdit) {
              sendToClient(ws, { type: 'error', message: 'Permission denied' });
              return;
            }

            const updatedMessage = await prisma.message.update({
              where: { id: message.messageId },
              data: {
                content: message.content.trim(),
                isEdited: true
              },
              include: {
                instructor: {
                  select: { id: true, name: true, profilePic: true }
                },
                student: {
                  select: { id: true, name: true, profilePic: true }
                }
              }
            });

            broadcastToClassroom(ws.classroomId, {
              type: 'edit_message',
              id: updatedMessage.id,
              content: updatedMessage.content,
              isEdited: true,
              userId: updatedMessage.instructorId || updatedMessage.studentId,
              userName: updatedMessage.instructor?.name || updatedMessage.student?.name,
              userProfilePic: updatedMessage.instructor?.profilePic || updatedMessage.student?.profilePic
            });
            break;

          default:
            sendToClient(ws, { type: 'error', message: 'Unknown message type' });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        sendToClient(ws, { type: 'error', message: 'Internal server error' });
      }
    });

    ws.on('close', () => {
      if (ws.classroomId && authenticated) {
        const connections = classroomConnections.get(ws.classroomId);
        if (connections) {
          connections.delete(ws as any);
          if (connections.size === 0) {
            classroomConnections.delete(ws.classroomId);
          }
        }
        console.log(`User ${ws.userName} left classroom ${ws.classroomId}`);
      }
    });

    ws.on('error', (error: unknown) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
  return wss;
}