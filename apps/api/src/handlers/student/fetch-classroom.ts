import { prisma } from "@repo/db";
import { Request, Response } from "express";

export const fetchClassroom = async (req: Request, res: Response) => {
  try {
    const student = req.user;

    if (!student) {
      return res.status(401).json({
        message: "Authentication Error",
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
      return res.status(404).json({
        message: "No classrooms found for the student",
      });
    }

    return res.json({
      message: "Student's classrooms fetched successfully",
      classrooms: classrooms.map((sc) => sc.classroom),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};
