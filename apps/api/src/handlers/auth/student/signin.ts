import { Request, Response } from "express"
import z from "zod"


const signinSchema = z.object({
    email: z.email(),
    password: z.string()  
})


export const signinStudentHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const parsedBody = signinSchema.safeParse(body)
        if(!parsedBody.success) {
            res.status(411).json({
                message: "Please provide correct inputs"
            })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}