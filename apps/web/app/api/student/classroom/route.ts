import { studentAuth } from "@/actions/studentAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const student = await studentAuth();
    if (!student) {
      return NextResponse.json({
        message: "Authentication Error",
      }, {
        status: 401,
      });
    }

    const classrooms = await prisma.studentClassroom.findMany({
      where: {
        studentId: student.id,  
      },
      include: {
        classroom: true, 
      },
    });

    if (classrooms.length === 0) {
      return NextResponse.json({
        message: "No classrooms found for the student",
      }, {
        status: 404,
      });
    }

    return NextResponse.json({
      message: "Student's classrooms fetched successfully",
      classrooms: classrooms.map((sc) => sc.classroom), 
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
