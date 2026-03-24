import { Request, Response } from "express";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@repo/db";

const attemptQuizSchema = z.object({
  quizId: z.string(),
  questionAnswers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().optional(),
    }),
  ),
});

export const submitQuiz = async (req: Request, res: Response) => {
  console.log("hey")
  try {
    console.log("🚀 submitQuiz called");

    const { classroomId } = req.params;
    const parsedBody = attemptQuizSchema.safeParse(req.body);
    const student = req.user;

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid body",
      });
    }

    if (!student) {
      return res.status(401).json({
        message: "Authentication Error",
      });
    }

    const studentExistsInClass = await prisma.studentClassroom.findFirst({
      where: {
        studentId: student.id,
        classroomId: classroomId as string,
      },
    });

    if (!studentExistsInClass) {
      return res.status(404).json({
        message: "Student not enrolled",
      });
    }

    const { quizId, questionAnswers } = parsedBody.data;

    const result = await prisma.$transaction(async (tx) => {
      console.log("📦 Transaction started");

      const questions = await tx.question.findMany({
        where: { quizId },
        include: { options: true },
      });

      const totalQuestions = questions.length;

      const correctOptionIds = new Set<string>();

      questions.forEach((q) => {
        const correct = q.options.find((o) => o.isCorrect);
        if (correct) correctOptionIds.add(correct.id);
      });

      let correctAnswerCount = 0;

      questionAnswers.forEach((qa) => {
        if (qa.optionId && correctOptionIds.has(qa.optionId)) {
          correctAnswerCount++;
        }
      });

      const quizAttempt = await tx.quizAttempt.create({
        data: {
          attemptedById: student.id,
          quizId,
          totalCount: totalQuestions,
          correctCount: correctAnswerCount,
        },
      });

      const answersToInsert = questionAnswers.map((qa) => ({
        id: uuidv4(),
        questionId: qa.questionId,
        selectedOptionId: qa.optionId ?? null,
        isCorrect: qa.optionId
          ? correctOptionIds.has(qa.optionId)
          : false,
        quizAttemptId: quizAttempt.id,
      }));

      await tx.quizAnswer.createMany({
        data: answersToInsert,
      });

      console.log("✅ Transaction done");

      return {
        correctAnswerCount,
        totalQuestions,
        attemptId: quizAttempt.id,
      };
    });

    console.log("🎯 Sending response");

    return res.json({
      message: "Quiz submitted successfully",
      correctAnswerCount: result.correctAnswerCount,
      totalQuestionCount: result.totalQuestions,
      attemptId: result.attemptId, // ✅ IMPORTANT
    });

  } catch (error) {
    console.error("❌ submitQuiz error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};