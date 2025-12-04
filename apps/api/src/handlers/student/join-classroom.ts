import { prisma } from "@repo/db";
import { Request, Response } from "express";

export const joinClassroom = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    const student = req.user;

    if (!student) {
      return res.status(401).json({
        message: "Authentication Error",
      });
    }

    if (!classroomId) {
      return res.status(400).json({
        message: "Classroom ID is required",
      });
    }

    const existingRelation = await prisma.studentClassroom.findFirst({
      where: {
        studentId: student.id,
        classroomId,
      },
    });

    if (existingRelation) {
      return res.status(400).json({
        message: "Student already in classroom",
      });
    }

    const studentClassroom = await prisma.studentClassroom.create({
      data: {
        studentId: student.id,
        classroomId,
      },
      include: {
        student: true,
        classroom: true,
      },
    });

    return res.json({
      message: "Student joined the classroom",
      studentClassroom,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};
