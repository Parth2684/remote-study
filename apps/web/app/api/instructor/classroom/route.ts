import { instructorAuth } from "@/actions/instructorAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const instructor = await instructorAuth();
    if (!instructor) {
      return NextResponse.json({
        message: "Authentication Error",
      }, {
        status: 401,
      });
    }

    const classrooms = await prisma.classroom.findMany({
      where: {
        instructorId: instructor.id, 
      },
      include: {
        instructor: true, 
        students: true, 
        messages: true, 
        quizzes: true,  
      },
    });

    if (classrooms.length === 0) {
      return NextResponse.json({
        message: "No classrooms found for the instructor",
      }, {
        status: 404,
      });
    }

    return NextResponse.json({
      message: "Instructor's classrooms fetched successfully",
      classrooms,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Server Error",
    }, {
      status: 500,
    });
  }
}
