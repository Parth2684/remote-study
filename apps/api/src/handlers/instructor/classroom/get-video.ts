import { prisma } from "@repo/db"
import { Request, Response } from "express"

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params

    const video = await prisma.video.findUnique({
      where: { id: videoId as string }
    })

    if (!video) {
      res.status(404).json({ msg: "Video not found" })
      return
    }

    res.json({ video })

  } catch (err) {
    res.status(500).json({ msg: "Error fetching video" })
  }
}