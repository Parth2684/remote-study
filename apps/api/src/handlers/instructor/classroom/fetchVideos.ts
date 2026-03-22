import { prisma } from "@repo/db"
import { Request, Response } from "express"


export const fetchVideos = async(req: Request, res: Response) => {
    try {
        const classroomId = req.params.classroomId as string
        console.log("Fetching videos for classroom:", classroomId)
        const videos = await prisma.video.findMany({
            where: {
                classroomId: classroomId,
            },
            include: {
                classroom: true
            },
            orderBy: {
                uploadedAt: "desc"
            }   
        })
        console.log("Found videos:", videos)
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