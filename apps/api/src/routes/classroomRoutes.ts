import { Router } from 'express';
import { prisma } from '@repo/db';
import { studentAuth, instructorAuth } from '../middleware/auth';

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
      role: msg.instructorId ? 'INSTRUCTOR' : 'STUDENT'
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
      role: message.instructorId ? 'INSTRUCTOR' : 'STUDENT'
    };

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
      role: updatedMessage.instructorId ? 'INSTRUCTOR' : 'STUDENT'
    };

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;