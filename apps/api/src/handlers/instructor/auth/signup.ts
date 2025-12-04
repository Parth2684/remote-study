import { prisma } from "@repo/db"
import { Request, Response } from "express"
import z from "zod"
import jwt from "jsonwebtoken"
import { EMAIL_PASS, EMAIL_USER, FRONTEND_URL, JWT_SECRET } from "../../../export"
import { v4 as uuidv4 } from "uuid"
import nodemailer from "nodemailer"


const signupSchema = z.object({
    name: z.string(),
    email: z.email(),
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
})

const sendEmail = async (email: string, subject: string, html: string) => transporter.sendMail({
    from: "EduLite",
    to: email,
    subject,
    html
})

export const signupStudentHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const parsedBody = signupSchema.safeParse(body)
        if (!parsedBody.success) {
            res.status(411).json({
                message: "Please provide correct inputs"
            })
            return;
        }
        const { name, email } = parsedBody.data
        const [existingInstructor, isStudent] = await Promise.all([
            prisma.instructor.findUnique({
                where: {
                    email,
                    verified: false
                }
            }), 
            prisma.student.findUnique({
                where: {
                    email
                }
            })
        ])

        if(existingInstructor?.verified == true) {
            res.status(409).json({
                message: "Instructor already exists"
            })
            return
        }

        if(isStudent) {
            res.status(409).json({
                message: "Instructors cannot signup as students"
            })
            return
        }

        const instructorId = uuidv4()

        const token = jwt.sign({
            userId: instructorId,
            email,
            name,
            role: "INSTRUCTOR"
        }, JWT_SECRET)

        const [instructor, emailSent] = await Promise.all([
            prisma.instructor.upsert({
                where: {
                    email,
                    verified: false
                },
                update: {
                    id: instructorId,
                    name,
                    token,
                    tokenExpiry: new Date(Date.now() + (24 * 60 * 60 * 1000))
                },
                create: {
                    id: instructorId,
                    email,
                    name,
                    token,
                    tokenExpiry: new Date(Date.now() + (24 * 60 * 60 * 1000))
                }
            }),
            sendEmail(email, "Verify and Set Password to your Email", `<p> Hi ${name}, click <a href="${FRONTEND_URL}/set-password?token=${token}">here</a> to verify your email and set the password. It is only valid for 24 hours</p>`)
        ])

        if(!instructor) {
            throw new Error("Couldn't create account")
        }
        
        if(!emailSent) {
            throw new Error("Email service is not working please try later")
        }

        res.json({
            message: "You've been sent an email to set a password for your account"
        })
    } catch (error) {
        console.error(error)
        res.json({
            message: "Server Error"
        }).status(500)
    }
}   