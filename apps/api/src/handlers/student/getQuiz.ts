import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizForStudent = async (req: Request, res: Response) => {
  try {
    const student = req.user
    const { quizId } = req.params

    if (!student) {
      return res.status(401).json({
        message: "Authentication Error",
      })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        classroom: {
          select: {
            id: true,
            students: {
              where: {
                studentId: student.id,
              },
            },
          },
        },
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      })
    }

    // 🚫 Student not enrolled
    if (quiz.classroom.students.length === 0) {
      return res.status(403).json({
        message: "You are not enrolled in this classroom",
      })
    }

    return res.status(200).json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
        })),
      },
      classroomId: quiz.classroom.id,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Server Error",
    })
  }
}
