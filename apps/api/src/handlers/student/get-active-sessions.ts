import { Request, Response } from "express"
import { RoomService } from "../../services/room-service"

export const getActiveSession = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params

    if (!classId) {
      return res.status(400).json({
        message: "Classroom ID is required"
      })
    }

    const session = await RoomService.getActiveSession(classId)

    return res.status(200).json({
      session: session || null
    })

  } catch (error: any) {
    console.error("Error fetching active session:", error)

    return res.status(500).json({
      message: error.message || "Internal server error"
    })
  }
}