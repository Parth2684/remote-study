import { prisma } from "@repo/db"
import { Request, Response } from "express"
import z from "zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../../../export"


const signinSchema = z.object({
    email: z.email(),
    password: z.string()  
})


export const signinInstructorHandler = async (req: Request, res: Response) => {
    try {
        
        const body = req.body
        const parsedBody = signinSchema.safeParse(body)
        if(!parsedBody.success) {
            res.status(400).json({
                message: "Please provide correct inputs",
                error: parsedBody.error.message
            })
            return
        }
        const { email, password } = parsedBody.data
        const [student, instructor] = await Promise.all([
            prisma.student.findUnique({
                where: {
                    email
                }
            }),
            prisma.instructor.findUnique({
                where: {
                    email
                }
            })
        ])

        if(student) {
            res.status(403).json({
                message: "You cannot signin as a instructor, you are a student"
            })
            return;
        }

        if(!instructor) {
            res.status(404).json({
                message: "Instructor account not found"
            })
            return
        }

        if(!instructor.verified) {
            res.status(403).json({
                message: "Please verify your account before signing in"
            })
            return
        }


        const validPassword = await bcrypt.compare(password, instructor.password!)
        if(!validPassword) {
            res.status(401).json({
                message: "Incorrect Password"
            })
            return
        }

        const returnInstructor = {
            id: instructor.id,
            email,
            name: instructor.name
        }

        const token = jwt.sign({
            id: instructor.id,
            email,
            name: instructor.name,
            role: "INSTRUCTOR"
        }, JWT_SECRET, {
            expiresIn: "7d"
        })
        
        res.cookie("authToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : undefined,
            path: '/',
        })

        res.json({
            message: "Signin Successful",
            student: returnInstructor
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}