import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizzesForStudent = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params
    const studentId = req.user.id

    const quizzes = await prisma.quiz.findMany({
      where: {
        classroomId: classId as string
      },
      include: {
        quizAttempts: {
          where: {
            attemptedById: studentId
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })

    const formatted = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      attempted: quiz.quizAttempts.length > 0
    }))

    res.json({ quizzes: formatted })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching quizzes" })
  }
}