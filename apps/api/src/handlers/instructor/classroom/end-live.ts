import { Request, Response } from "express"
import { RoomService } from "../../../services/room-service"

export const endLive = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params

        if (!sessionId) {
            return res.status(400).json({
                message: "Session ID is required"
            })
        }
        const instructorId = req.user.id

        const result = await RoomService.endSession(sessionId as string, instructorId)

        res.json(result)
    } catch (error: any) {
        console.error("Error while ending live session: ", error)

        res.status(500).json({
            msg: error.message || "Internal server error"
        })
    }
}