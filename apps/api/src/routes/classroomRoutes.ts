import { Router } from 'express';
import { prisma } from '@repo/db';
import { studentAuth, instructorAuth } from '../middleware/auth';
import { documentUpload } from '../middleware/documentUpload';
import { broadcastToClassroom } from '../websocket';
import path from 'path';
import fs from 'fs';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();

const classroomAuth = (req: any, res: any, next: any) => {
  studentAuth(req, res, (err?: any) => {
    if (!err && req.user) {
      return next();
    }
    instructorAuth(req, res, next);
  });
};

router.get('/:classroomId/messages', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { where: { studentId: userId } }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const hasAccess = 
      (userRole === 'INSTRUCTOR' && classroom.instructorId === userId) ||
      (userRole === 'STUDENT' && classroom.students.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: {
        classroomId,
        isDeleted: false,
        ...(before && { createdAt: { lt: new Date(before as string) } })
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
      take: Number(limit)
    });

    const formattedMessages = messages.reverse().map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      isEdited: msg.isEdited,
      userId: msg.instructorId || msg.studentId,
      userName: msg.instructor?.name || msg.student?.name,
      userProfilePic: msg.instructor?.profilePic || msg.student?.profilePic,
      role: msg.instructorId ? 'INSTRUCTOR' : 'STUDENT',
      documentUrl: msg.documentUrl,
      documentName: msg.documentName,
      documentType: msg.documentType,
      documentSize: msg.documentSize
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/:classroomId/messages', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { where: { studentId: userId } }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const hasAccess = 
      (userRole === 'INSTRUCTOR' && classroom.instructorId === userId) ||
      (userRole === 'STUDENT' && classroom.students.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        classroomId,
        ...(userRole === 'INSTRUCTOR' 
          ? { instructorId: userId }
          : { studentId: userId }
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

    const formattedMessage = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      isEdited: message.isEdited,
      userId: message.instructorId || message.studentId,
      userName: message.instructor?.name || message.student?.name,
      userProfilePic: message.instructor?.profilePic || message.student?.profilePic,
      role: message.instructorId ? 'INSTRUCTOR' : 'STUDENT',
      documentUrl: message.documentUrl,
      documentName: message.documentName,
      documentType: message.documentType,
      documentSize: message.documentSize
    };

    // Broadcast the message to all connected WebSocket clients
    broadcastToClassroom(classroomId, {
      type: 'new_message',
      ...formattedMessage
    });

    res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

router.delete('/:classroomId/messages/:messageId', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId, messageId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const canDelete = 
      (userRole === 'INSTRUCTOR' && message.instructorId === userId) ||
      (userRole === 'STUDENT' && message.studentId === userId) ||
      (userRole === 'INSTRUCTOR'); 

    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true }
    });

    // Broadcast the deletion to all connected WebSocket clients
    broadcastToClassroom(classroomId, {
      type: 'delete_message',
      messageId: messageId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.patch('/:classroomId/messages/:messageId', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId, messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const canEdit = 
      (userRole === 'INSTRUCTOR' && message.instructorId === userId) ||
      (userRole === 'STUDENT' && message.studentId === userId);

    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
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

    const formattedMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      createdAt: updatedMessage.createdAt.toISOString(),
      isEdited: updatedMessage.isEdited,
      userId: updatedMessage.instructorId || updatedMessage.studentId,
      userName: updatedMessage.instructor?.name || updatedMessage.student?.name,
      userProfilePic: updatedMessage.instructor?.profilePic || updatedMessage.student?.profilePic,
      role: updatedMessage.instructorId ? 'INSTRUCTOR' : 'STUDENT',
      documentUrl: updatedMessage.documentUrl,
      documentName: updatedMessage.documentName,
      documentType: updatedMessage.documentType,
      documentSize: updatedMessage.documentSize
    };

    // Broadcast the edit to all connected WebSocket clients
    broadcastToClassroom(classroomId, {
      type: 'edit_message',
      ...formattedMessage
    });

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Upload document to classroom
router.post('/:classroomId/documents', classroomAuth, documentUpload.single('document'), async (req: any, res) => {
  try {
    const { classroomId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    // Verify classroom access
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { where: { studentId: userId } }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const hasAccess = 
      (userRole === 'INSTRUCTOR' && classroom.instructorId === userId) ||
      (userRole === 'STUDENT' && classroom.students.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message with document attachment
    const message = await prisma.message.create({
      data: {
        content: content?.trim() || `Shared a document: ${req.file.originalname}`,
        classroomId,
        documentUrl: `/api/classroom/${classroomId}/documents/${req.file.filename}`,
        documentName: req.file.originalname,
        documentType: req.file.mimetype,
        documentSize: req.file.size,
        ...(userRole === 'INSTRUCTOR' 
          ? { instructorId: userId }
          : { studentId: userId }
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

    const formattedMessage = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      isEdited: message.isEdited,
      userId: message.instructorId || message.studentId,
      userName: message.instructor?.name || message.student?.name,
      userProfilePic: message.instructor?.profilePic || message.student?.profilePic,
      role: message.instructorId ? 'INSTRUCTOR' : 'STUDENT',
      documentUrl: message.documentUrl,
      documentName: message.documentName,
      documentType: message.documentType,
      documentSize: message.documentSize
    };

    // Broadcast the document message to all connected WebSocket clients
    broadcastToClassroom(classroomId, {
      type: 'new_message',
      ...formattedMessage
    });

    res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get all documents for a classroom
router.get('/:classroomId/documents', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify classroom access
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { where: { studentId: userId } }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const hasAccess = 
      (userRole === 'INSTRUCTOR' && classroom.instructorId === userId) ||
      (userRole === 'STUDENT' && classroom.students.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all messages with documents
    const documents = await prisma.message.findMany({
      where: {
        classroomId,
        isDeleted: false,
        documentUrl: {
          not: null
        }
      },
      include: {
        instructor: {
          select: { id: true, name: true, profilePic: true }
        },
        student: {
          select: { id: true, name: true, profilePic: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedDocuments = documents.map((doc: any) => ({
      id: doc.id,
      content: doc.content,
      createdAt: doc.createdAt.toISOString(),
      userId: doc.instructorId || doc.studentId,
      userName: doc.instructor?.name || doc.student?.name,
      userProfilePic: doc.instructor?.profilePic || doc.student?.profilePic,
      role: doc.instructorId ? 'INSTRUCTOR' : 'STUDENT',
      documentUrl: doc.documentUrl,
      documentName: doc.documentName,
      documentType: doc.documentType,
      documentSize: doc.documentSize
    }));

    res.json({ documents: formattedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Serve document file
router.get('/:classroomId/documents/:filename', classroomAuth, async (req: any, res) => {
  try {
    const { classroomId, filename } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify classroom access
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { where: { studentId: userId } }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const hasAccess = 
      (userRole === 'INSTRUCTOR' && classroom.instructorId === userId) ||
      (userRole === 'STUDENT' && classroom.students.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Serve the file
    const filePath = path.join(__dirname, '../../../uploads/documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Failed to serve document' });
  }
});

export default router;