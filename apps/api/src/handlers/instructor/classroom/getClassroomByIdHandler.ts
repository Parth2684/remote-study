import { Request, Response } from "express";
import { prisma } from "@repo/db";
import z from "zod";

const classroomIdSchema = z.object({
  id: z.string().uuid(),
});

export const getClassroomByIdHandler = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Validate params
    const parsedParams = classroomIdSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: "Invalid classroom id",
      });
    }

    const { id } = parsedParams.data;

    // 2️⃣ Fetch classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePic: true,
              },
            },
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!classroom) {
      return res.status(404).json({
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        description: classroom.description,
        instructor: classroom.instructor,
        students: classroom.students.map((s) => s.student),
        quizzes: classroom.quizzes,
      },
    });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return res.status(500).json({
      message: "Failed to fetch classroom",
    });
  }
};
