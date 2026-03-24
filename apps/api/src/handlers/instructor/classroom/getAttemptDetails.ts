import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params

    const attempt = await prisma.quizAttempt.findUnique({
      where: {
        id: attemptId as string
      },
      include: {
        attemptedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        quizAnswers: {
          include: {
            question: {
              include: {
                options: true
              }
            },
            selectedOption: true
          }
        }
      }
    })

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" })
    }

    const formatted = {
      id: attempt.id,
      student: attempt.attemptedBy,
      score: attempt.correctCount,
      total: attempt.totalCount,
      answers: attempt.quizAnswers.map((ans) => ({
        questionId: ans.questionId,
        question: ans.question.text,

        options: ans.question.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect
        })),

        selectedOption: ans.selectedOption
          ? {
              id: ans.selectedOption.id,
              text: ans.selectedOption.text
            }
          : null,

        isCorrect: ans.isCorrect
      }))
    }

    res.json({ attempt: formatted })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching attempt details" })
  }
}