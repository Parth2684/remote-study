import { studentAuth } from "@/actions/studentAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";


const attemptQuizSchema = z.object({
    quizId: z.string(),
    questionAnswers: z.array(
        z.object({
            questionId: z.string(),
            optionId: z.string().optional()
        })
    )
})

export const POST = async (req: NextRequest, { params }: { params: { classroomId: string } }) => {
    try {
        const [body, student] = await Promise.all([
            req.json(),
            studentAuth()
        ])
        const parsedBody = attemptQuizSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Please give appropriate Body"
            })
        }

        if(!student) {
            return NextResponse.json({
                message: "Auth Error"
            }, {
                status: 401
            })
        }

        const studentExistsInCLass = prisma.studentClassroom.findFirst({
            where: { 
                studentId: student.id,
                classroomId: params.classroomId
            }
        })

        if(!studentExistsInCLass) {
            return NextResponse.json({
                message: "Student Not enrolled in classroom"
            })
        }

        const { quizId, questionAnswers } = parsedBody.data

        const saveToDb = await prisma.$transaction(async (tx) => {
            const questions = await tx.question.findMany({
                where: { quizId }, include: { options: true }
            })

            const totalQuestions = questions.length
            const correctOptionIds = new Set()

            let correctAnswerCount = 0;

            questions.forEach((question) => {
                const correctOption = question.options.find(opt => opt.isCorrect)
                if(correctOption) {
                    correctOptionIds.add(correctOption.id)
                }
            })

            questionAnswers.map((questionAnswerPair) => {
                if(correctOptionIds.has(questionAnswerPair.optionId)) {
                    correctAnswerCount++;
                }
            })

            const quizAttempt = await tx.quizAttempt.create({
                data: {
                    attemptedById: student.id,
                    quizId: quizId,
                    totalCount: totalQuestions,
                    correctCount: correctAnswerCount
                }
            })

            const quizAnswerArray = questionAnswers.map((questionAnswerPair) => {
                return {
                    id: uuidv4(),
                    questionId: questionAnswerPair.questionId,
                    selectedOptionId: questionAnswerPair.optionId ?? null,
                    isCorrect: questionAnswerPair.optionId ? correctOptionIds.has(questionAnswerPair.optionId) : false,
                    quizAttemptId: quizAttempt.id
                }
            })

            await tx.quizAnswer.createMany({
                data: quizAnswerArray
            })

            return {
                correctAnswerCount,
                totalQuestions
            }
        })

        return NextResponse.json({
            message: "Quiz submitted successfully",
            correctAnswerCount: saveToDb.correctAnswerCount,
            totalQuestionCount: saveToDb.totalQuestions
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