import { Request, Response } from "express"
import { RoomService } from "../../services/room-service"

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params

    if (!classId) {
      return res.status(400).json({
        message: "Classroom ID is required"
      })
    }

    const sessions = await RoomService.getAllSessions(classId)

    return res.status(200).json({
      sessions
    })

  } catch (error: any) {
    console.error("Error fetching sessions:", error)

    return res.status(500).json({
      message: error.message || "Internal server error"
    })
  }
}