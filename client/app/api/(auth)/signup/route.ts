import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcrypt"


const signupSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"])
})

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const parsedBody = signupSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Incorrect or Incomplete details"
            }, {
                status: 411
            })
        }
    
        const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10) 
        
        const role = parsedBody.data.role 
        if(role == "INSTRUCTOR") {
            await prisma.instructor.create({
                data: {
                    name: parsedBody.data.name,
                    email: parsedBody.data.email,
                    password: hashedPassword
                }
            })
        }else {
            await prisma.student.create({
                data: {
                    name: parsedBody.data.name,
                    email: parsedBody.data.email,
                    password: hashedPassword
                }
            })
        }
        return NextResponse.json({
            message: `Created a ${role} account`
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: "Error creating account"
        }, {
            status: 500
        })
    }

} 