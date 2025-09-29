import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params
        const classroom = await prisma.classroom.findUnique({
            where: {
                id
            }, 
            include: {
                instructor: true,
                students: true,
                quizzes: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    },
                    include: {
                        quizAttempts: true
                    }
                }
            }
        })

        if(!classroom) {
            return NextResponse.json({
                message: "Classroom not  found"
            }, {
                status: 404
            })
        }

        const classData = {
            name: classroom.name,
            instructor: classroom.instructor.name,
            description: classroom.description,
            code: classroom.id
        }

        const quizzes = classroom.quizzes.map((quiz) => {
            return {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                attempts: quiz.quizAttempts.length
            }
        })

        return NextResponse.json({
            message: "Success",
            classData,
            quizzes
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