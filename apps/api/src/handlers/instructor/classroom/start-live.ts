import { prisma } from "@repo/db"
import { Request, Response } from "express"
import { RoomService } from "../../../services/room-service"

export const startLive = async (req: Request, res: Response) => {
    try {
        const { classroomId, title, roomName } = req.body
        const instructorId = req.user.id

        const result = await RoomService.startSession(classroomId, instructorId, title, roomName)

        res.status(200).json(result)
        
    } catch (error: any) {
        console.error("Error while starting live session: ", error)
        res.status(500).json({
            msg: error.message || "Internal server error"
        })
    }
}