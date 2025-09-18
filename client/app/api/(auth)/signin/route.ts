import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers";

const signinSchema = z.object({
    email: z.string(),
    password: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"])
})

const JWT_SECRET = process.env.JWT_SECRET! 

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const parsedBody = signinSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Invalid input"
            }, {
                status: 411
            })
        }
        const { email, password, role } = parsedBody.data
        let user;
        if (role == "INSTRUCTOR") {
            user = await prisma.instructor.findUnique({
                where: {
                    email
                }
            })
        }else {
            user = await prisma.student.findUnique({
                where: {
                    email
                }
            })
        }
        if(!user) {
            return NextResponse.json({
                message: "Couldn't find the user"
            }, {
                status: 401
            })
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch) {
            return NextResponse.json({
                message: "Incorrect Password"
            }, {
                status: 401
            })
        }
    
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role
        }, JWT_SECRET, { expiresIn: "7d" });
    
        (await cookies()).set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        })
    
        return NextResponse.json({
            message: "Signed In",
            user
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