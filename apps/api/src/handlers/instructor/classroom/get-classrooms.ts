import { prisma } from '@repo/db'
import { Request, Response } from 'express'


export const getMyClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: {
        instructorId: req.user.id,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    res.status(200).json({
      classrooms: classrooms.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        instructor: c.instructor,
        studentsCount: c._count.students,
      })),
    })
  } catch (error) {
    console.error(error)
    res.json({
      message: "Error fetching classrooms"
    })
  }
}