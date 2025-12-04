import z from "zod"
import { Request, Response } from 'express'
import { prisma } from '@repo/db';
import { v4 as uuidv4 } from "uuid"

const quizSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    questionAnswer: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string().min(1, "Option cannot be empty")),
            correctOption: z.string().nonempty()
        })
    )
})

export const createQuizHandler = async(req:Request, res: Response) => {
  try{
    const body = req.body;
    const parsedBody = quizSchema.safeParse(body);
    if(!parsedBody.success) {
        res.json({
            message: "Please provide correct input"
        }).status(411)
        return
    }

    const { title, description, questionAnswer } = parsedBody.data
    const classroomId = req.params.classroomId;
    if(!classroomId) {
      res.status(411).json({
        message: "classroom id not provided"
      })
      return
    }

    await prisma.$transaction(async (tx) => {
        const quizId = uuidv4()
        await tx.quiz.create({
            data: {
                id: quizId,
                instructorId: req.user.id,
                title,
                description,
                classroomId: classroomId
            }
        })

        const { questionArray, optionArray } = questionAnswer.reduce<{ questionArray: { id: string; text: string; quizId: string }[], optionArray: { id: string; text: string; isCorrect: boolean; questionId: string }[] }>(
            (acc, questionAnswerPair) => {
                const id = uuidv4();
            
                const options = questionAnswerPair.options.map((option) => ({
                id: uuidv4(),
                text: option,
                isCorrect: option === questionAnswerPair.correctOption,
                questionId: id,
                }));
            
                acc.questionArray.push({
                id,
                text: questionAnswerPair.question,
                quizId,
                });
            
                acc.optionArray.push(...options);
            
                return acc;
            },
            { questionArray: [], optionArray: [] }
        );
        await Promise.all([
            tx.question.createMany({
                data: questionArray
            }),
            tx.option.createMany({
                data: optionArray
            })
        ])
    })
  }catch(err) {
    console.error(err);
    res.status(500).json({
      message: "Error while creating class"
    })
  }
}
