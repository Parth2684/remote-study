import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizResult = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params
    const studentId = req.user?.id

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId: quizId as string,
        attemptedById: studentId
      },
      include: {
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
      return res.status(404).json({ message: "Quiz not attempted" })
    }

    const formatted = {
      attemptId: attempt.id,
      score: attempt.correctCount,
      total: attempt.totalCount,

      questions: attempt.quizAnswers.map((ans) => ({
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

    res.json({ result: formatted })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching result" })
  }
}