import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizzesWithAttempts = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params
    const instructorId = req.user.id

    const quizzes = await prisma.quiz.findMany({
      where: {
        classroomId: classId as string,
        instructorId
      },
      include: {
        _count: {
          select: {
            quizAttempts: true
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
      attempts: quiz._count.quizAttempts
    }))

    res.json({ quizzes: formatted })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching quizzes" })
  }
}