import z from "zod";
import { Request, Response } from "express";
import { prisma } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

const quizSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questionAnswer: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string().min(1, "Option cannot be empty")),
      correctOption: z.string().nonempty(),
    }),
  ),
});

export const createQuizHandler = async (req: Request, res: Response) => {
  try {
    const parsedBody = quizSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Please provide correct input",
        error: parsedBody.error,
      });
    }

    const { title, description, questionAnswer } = parsedBody.data;
    const classroomId = req.params.classroomId;

    if (!classroomId) {
      return res.status(400).json({
        message: "classroom id not provided",
      });
    }

    const quizId = uuidv4();

    await prisma.$transaction(async (tx) => {
      await tx.quiz.create({
        data: {
          id: quizId,
          instructorId: req.user.id,
          title,
          description,
          classroomId: classroomId as string,
        },
      });

      const { questionArray, optionArray } = questionAnswer.reduce<{
        questionArray: { id: string; text: string; quizId: string }[];
        optionArray: {
          id: string;
          text: string;
          isCorrect: boolean;
          questionId: string;
        }[];
      }>(
        (acc, qa) => {
          const questionId = uuidv4();

          acc.questionArray.push({
            id: questionId,
            text: qa.question,
            quizId,
          });

          qa.options.forEach((opt) => {
            acc.optionArray.push({
              id: uuidv4(),
              text: opt,
              isCorrect: opt === qa.correctOption,
              questionId,
            });
          });

          return acc;
        },
        { questionArray: [], optionArray: [] }
      );

      await tx.question.createMany({
        data: questionArray,
      });

      await tx.option.createMany({
        data: optionArray,
      });
    });

    // ✅ IMPORTANT: always send response
    return res.status(201).json({
      message: "Quiz created successfully",
      quizId,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Error while creating quiz",
    });
  }
};