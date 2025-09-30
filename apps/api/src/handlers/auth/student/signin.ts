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


export const signinStudentHandler = async (req: Request, res: Response) => {
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

        if(instructor) {
            res.status(403).json({
                message: "You cannot signin as a student"
            })
            return;
        }

        if(!student) {
            res.status(404).json({
                message: "Student account not found"
            })
            return
        }

        if(!student.verified) {
            res.status(403).json({
                message: "Please verify your account before signing in"
            })
            return
        }

        if(student.provider !== "CREDENTIALS" || !student.password) {
            res.status(403).json({
                message: "Please signin via correct provider"
            })
            return;
        }

        const validPassword = await bcrypt.compare(password, student.password)
        if(!validPassword) {
            res.status(401).json({
                message: "Incorrect Password"
            })
            return
        }

        const returnStudent = {
            id: student.id,
            email,
            name: student.name
        }

        const token = jwt.sign({
            id: student.id,
            email,
            name: student.name,
            role: "STUDENT"
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
            student: returnStudent
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}