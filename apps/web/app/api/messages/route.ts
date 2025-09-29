import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, classroomId, senderId, senderType } = await request.json();

    if (!content || !classroomId || !senderId || !senderType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messageData: any = {
      content,
      classroomId,
    };

    if (senderType === 'instructor') {
      messageData.instructorId = senderId;
    } else {
      messageData.studentId = senderId;
    }

    const message = await prisma.message.create({
      data: messageData,
      include: {
        instructor: {
          select: { id: true, name: true }
        },
        student: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

