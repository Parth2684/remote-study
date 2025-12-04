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
  try {
    const { classroomId } = req.params;
    const body = req.body;
    const student = req.user;

    const parsedBody = attemptQuizSchema.safeParse(body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Please provide an appropriate body",
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
        classroomId,
      },
    });

    if (!studentExistsInClass) {
      return res.status(404).json({
        message: "Student not enrolled in classroom",
      });
    }

    const { quizId, questionAnswers } = parsedBody.data;

    const saveToDb = await prisma.$transaction(async (tx) => {
      const questions = await tx.question.findMany({
        where: { quizId },
        include: { options: true },
      });

      const totalQuestions = questions.length;
      const correctOptionIds = new Set<string>();
      let correctAnswerCount = 0;

      questions.forEach((question) => {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (correctOption) {
          correctOptionIds.add(correctOption.id);
        }
      });

      questionAnswers.forEach((questionAnswerPair) => {
        if (correctOptionIds.has(questionAnswerPair.optionId as string)) {
          correctAnswerCount++;
        }
      });

      const quizAttempt = await tx.quizAttempt.create({
        data: {
          attemptedById: student.id,
          quizId: quizId,
          totalCount: totalQuestions,
          correctCount: correctAnswerCount,
        },
      });

      const quizAnswerArray = questionAnswers.map((questionAnswerPair) => ({
        id: uuidv4(),
        questionId: questionAnswerPair.questionId,
        selectedOptionId: questionAnswerPair.optionId ?? null,
        isCorrect: questionAnswerPair.optionId
          ? correctOptionIds.has(questionAnswerPair.optionId)
          : false,
        quizAttemptId: quizAttempt.id,
      }));

      await tx.quizAnswer.createMany({
        data: quizAnswerArray,
      });

      return {
        correctAnswerCount,
        totalQuestions,
      };
    });

    return res.json({
      message: "Quiz submitted successfully",
      correctAnswerCount: saveToDb.correctAnswerCount,
      totalQuestionCount: saveToDb.totalQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};
