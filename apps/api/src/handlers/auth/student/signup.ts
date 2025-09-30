import { Request, Response } from "express"
import z from "zod"

const signupSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"])
})

export const signup = async (req: Request, res: Response) => {
    const body = req.body
    const parsedBody = signupSchema.safeParse(body)
    
}