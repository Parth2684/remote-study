import { Request, Response } from "express";
import { prisma } from "@repo/db";
import z from "zod";

const classroomParamsSchema = z.object({
  id: z.string().uuid(),
});

export const getStudentClassroomByIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const parsedParams = classroomParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: "Invalid classroom id",
      });
    }

    const classroomId = parsedParams.data.id;
    const studentId = req.user.id;

    const enrollment = await prisma.studentClassroom.findUnique({
      where: {
        studentId_classroomId: {
          studentId,
          classroomId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this classroom",
      });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
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
          include: {
            quizAttempts: {
              where: {
                attemptedById: studentId,
              },
              select: {
                id: true,
              },
            },
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
        quizzes: classroom.quizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          attempted: quiz.quizAttempts.length > 0,
          attemptId: quiz.quizAttempts[0]?.id || null,
        })),
      },
    });
  } catch (error) {
    console.error("Student classroom fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch classroom",
    });
  }
};