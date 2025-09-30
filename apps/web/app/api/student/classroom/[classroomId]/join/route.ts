import { studentAuth } from "@/actions/studentAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ classroomId: string }> }) {
    try {
        const { classroomId } = await params
        const student = await studentAuth()
        if(!student) {
            return NextResponse.json({
                message: "Authentication Error"
            }, {
                status: 401
            })
        }
        
        const existingRelation = await prisma.studentClassroom.findFirst({
            where: {
                studentId: student.id,
                classroomId
            }
        })

        // If the relation already exists, return 400
        if(existingRelation) {
            return NextResponse.json({
                message: "Student already in classroom"
            }, {
                status: 400
            })
        }

        const studentClassroom = await prisma.studentClassroom.create({
            data: {
                studentId: student.id,
                classroomId
            }, 
            include: {
                student: true,
                classroom: true
            }
        })

        return NextResponse.json({
            message: "Student joined the classroom",
            studentClassroom
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