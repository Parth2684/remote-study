import { prisma } from "@repo/db"
import { Request, Response } from "express"
import { RoomService } from "../../services/room-service"

export const joinLive = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body
        const studentId = req.user.id

        const session = await prisma.liveSession.findUnique({
            where: {
                id: sessionId
            }
        })

        if(!session){
            res.status(404).json({
                msg: "Session not found"
            })
        }

        const result = await RoomService.joinSession(sessionId, studentId)

        res.status(200).json(result)
    } catch (error: any) {
        console.error("Error while joining live session: ", error)
        res.status(400).json({
            msg: error.message || "Internal server error"
        })
    }
}