import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const getQuizAttemptResult = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params
    const studentId = req.user.id

    // 1️⃣ Fetch attempt
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId as string },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        quizAnswers: true // quizAnswer table
      }
    })

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found"
      })
    }

    // 🔐 ensure student owns this attempt
    if (attempt.attemptedById !== studentId) {
      return res.status(403).json({
        message: "Unauthorized"
      })
    }

    // 2️⃣ Map answers for quick lookup
    const answerMap = new Map<string, any>()
    attempt.quizAnswers.forEach((ans) => {
      answerMap.set(ans.questionId, ans)
    })

    // 3️⃣ Format response
    const questions = attempt.quiz.questions.map((q) => {
      const studentAnswer = answerMap.get(q.id)

      return {
        questionId: q.id,
        question: q.text,

        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect
        })),

        selectedOption: studentAnswer?.selectedOptionId
          ? q.options.find((o) => o.id === studentAnswer.selectedOptionId)
          : null,

        isCorrect: studentAnswer?.isCorrect ?? false
      }
    })

    return res.json({
      result: {
        score: attempt.correctCount,
        total: attempt.totalCount,
        questions
      }
    })

  } catch (err) {
    console.error("Error fetching quiz result:", err)
    return res.status(500).json({
      message: "Failed to fetch result"
    })
  }
}