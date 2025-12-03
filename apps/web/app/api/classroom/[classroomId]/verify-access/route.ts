import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST (
  req: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    // We now get the classroomId from the 'context' object
    const { classroomId } = await params;
    
    const body = await req.json();
    const { userId, userType } = body;

    console.log("--- Verifying Classroom Access ---");
    console.log("Received classroomId:", classroomId);
    console.log("Received userId:", userId);
    console.log("Received userType:", userType);

    if (!userId || !userType) {
      return NextResponse.json({ hasAccess: false, message: "Missing params" }, { status: 400 });
    }

    if (userType === "STUDENT") {
      const enrolled = await prisma.studentClassroom.findFirst({
        where: { classroomId: classroomId, studentId: userId },
      });
      console.log("Prisma query result (student):", enrolled);
      return NextResponse.json({ hasAccess: !!enrolled });
    }
    
    if (userType === "INSTRUCTOR") {
      const owns = await prisma.classroom.findFirst({
        where: { id: classroomId, instructorId: userId },
      });
      console.log("Prisma query result (instructor):", owns);
      return NextResponse.json({ hasAccess: !!owns });
    }

    return NextResponse.json({ hasAccess: false }, { status: 403 });

  } catch (error) {
    console.error("Error verifying classroom access:", error);
    return NextResponse.json({ hasAccess: false, message: "Internal Server Error" }, { status: 500 });
  }
};