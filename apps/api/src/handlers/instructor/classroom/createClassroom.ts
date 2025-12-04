import z from "zod"
import { Request, Response } from 'express'
import { prisma } from '@repo/db'

const createClassroomSchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

export const createClassroomHandler = async(req: Request, res: Response) => {
  try {
    const body = req.body
    const parsedBody = createClassroomSchema.safeParse(body)
    if (!parsedBody.success) {
      res.json({
        message: "Invalid Inputs"
      }).status(411);
      return
    }
    const classroom = await prisma.classroom.create({
      data: {
        name: parsedBody.data.name,
        instructorId: req.user.id,
        description: parsedBody.data.description || "No description of the class"
      }
    })
    
    res.json({
      classroom
    })
  }catch(err) {
    console.error(err)
    res.status(500).json({
      message: "Unable to create classroom"
    })
  }
}