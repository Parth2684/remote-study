import { prisma, Status } from "@repo/db"
import { Request, Response } from "express"


export const fetchVideos = async(req: Request, res: Response) => {
    try {
        const classroomId = req.params.classroomId as string
        console.log("class id: ", classroomId)

        const videos = await prisma.video.findMany({
            where: {
            classroomId: classroomId,
            status: Status.SUCCESS
            },
            include: {
                classroom: true
            },
            orderBy: {
                uploadedAt: "desc"
            }   
        })
        res.json({
            videos
        })
    } catch (error) {
      console.error("Error finding videos:", error) 
      res.status(500).json({
        message: "error finding videos"
      })
    }
}