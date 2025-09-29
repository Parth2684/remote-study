import { instructorAuth } from "@/actions/instructorAuth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const createClassroomSchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

export const POST = async (req: NextRequest) => {
    try {
        const [body, instructor] = await Promise.all([
            req.json(),
            instructorAuth()])
        if(!instructor) {
            return NextResponse.json({
                message: "You are not authorized to perform that action"
            }, {
                status: 401
            })
        }    
        
        const parsedBody = createClassroomSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Invalid Inputs"
            }, {
                status: 411
            })
        }
        const classroom = await prisma.classroom.create({
            data: {
                name: parsedBody.data.name,
                instructorId: instructor.id,
                description: parsedBody.data.description || "No description of the class"
            }
        })

        return NextResponse.json({
            classroom
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: "Server error"
        }, {
            status: 500
        })
    }
}