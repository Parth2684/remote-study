import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET (req: NextRequest, { params }: { params: Promise<{ classroomId: string }> }) {
  try {
    const { classroomId } = await params;

    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(classroom);
  } catch (error) {
    console.error("Error fetching classroom info:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
};
