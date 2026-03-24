import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizAttempts = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: quizId as string
      },
      include: {
        attemptedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })

    console.log("attempts. ", attempts)

    const formatted = attempts.map((attempt) => ({
      id: attempt.id,
      student: attempt.attemptedBy,
      score: attempt.correctCount,
      total: attempt.totalCount
    }))

    res.json({ attempts: formatted })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching attempts" })
  }
}