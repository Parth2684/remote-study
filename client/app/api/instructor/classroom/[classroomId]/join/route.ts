import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
) {
  try {
    const { studentId } = await request.json();
    const { classroomId } = params;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const existingRelation = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroomId
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Student already in classroom' },
        { status: 400 }
      );
    }

    const studentClassroom = await prisma.studentClassroom.create({
      data: {
        studentId,
        classroomId
      },
      include: {
        student: {
          select: { id: true, name: true }
        },
        classroom: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(studentClassroom);
  } catch (error) {
    console.error('Error joining classroom:', error);
    return NextResponse.json(
      { error: 'Failed to join classroom' },
      { status: 500 }
    );
  }
}
