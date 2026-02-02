import { prisma } from '@repo/db'
import { Request, Response } from 'express'


export const getMyClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: {
        instructorId: req.user.id
      }
    });
    res.json({
      classrooms
    })
  } catch (error) {
    console.error(error)
    res.json({
      message: "Error fetching classrooms"
    })
  }
}