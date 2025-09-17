import { instructorAuth } from "@/actions/instructorAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";



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

export const POST = async(req: NextRequest, { params }: { params: { classroomId: string } } ) => {
    try {
        const [body, instructor] = await Promise.all([
            req.json(),
            instructorAuth()
        ])
        if(!instructor) {
            return NextResponse.json({
                message: "Authentication Error"
            }, {
                status: 401
            })
        }
        const parsedBody = quizSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Please provide correct input"
            }, {
                status: 411
            })
        }
    
        const { title, description, questionAnswer } = parsedBody.data
    
        await prisma.$transaction(async (tx) => {
            const quizId = uuidv4()
            await tx.quiz.create({
                data: {
                    id: quizId,
                    instructorId: instructor.id,
                    title,
                    description,
                    classroomId: params.classroomId
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
    
        return NextResponse.json({
            message: "Quiz Created"
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: "Server Error"
        }, {
            status: 500
        })
    }
}