import { prisma } from "@repo/db"
import { AccessToken } from "livekit-server-sdk"

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!
const LIVEKIT_SECRET = process.env.LIVEKIT_SECRET!

export class RoomService {

  static async startSession(classroomId: string, instructorId: string, title: string, roomName: string) {

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId }
    })

    if (!classroom) {
      throw new Error("Classroom not found")
    }

    if (classroom.instructorId !== instructorId) {
      throw new Error("Unauthorized")
    }

    const existingLive = await prisma.liveSession.findFirst({
      where: {
        classroomId,
        status: "LIVE"
      }
    })

    if (existingLive) {
      throw new Error("Live session already running")
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        classroomId,
        instructorId,
        title,
        roomName,
        status: "LIVE",
        startedAt: new Date()
      }
    })

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_SECRET,
      {
        identity: instructorId,
        name: "Instructor"
      }
    )

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    })

    const jwt = await token.toJwt()

    return {
      liveSession,
      token: jwt,
      roomName
    }
  }

  static async endSession(sessionId: string, instructorId: string){
    const session = await prisma.liveSession.findUnique({
        where: {
            id: sessionId
        }
    })

    if(!session){
        throw new Error("Live Session not found")
    }

    if(instructorId != session.instructorId){
        throw new Error("Unauthorised")
    }

    if (session.status !== "LIVE") {
        throw new Error("Session already ended")
    }


    return await prisma.liveSession.update({
        where: {
            id: sessionId
        },
        data: {
            status: "ENDED",
            endedAt: new Date()
        }
    })
  }

  static async joinSession(liveSessionId: string, studentId: string) {

    const session = await prisma.liveSession.findUnique({
        where: { id: liveSessionId }
    })

    if (!session || session.status !== "LIVE") {
        throw new Error("Live session not active")
    }

    const token = new AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_SECRET,
        {
        identity: studentId,
        name: "Student"
        }
    )

    token.addGrant({
        room: session.roomName,
        roomJoin: true,
        canPublish: false,
        canSubscribe: true
    })

    const jwt = await token.toJwt()

    return {
        roomName: session.roomName,
        token: jwt
    }
  }

  static async getAllSessions(classroomId: string) {

    if (!classroomId) {
      throw new Error("Classroom ID is required")
    }

    const sessions = await prisma.liveSession.findMany({
      where: {
        classroomId,
      },
      orderBy: {
        startedAt: "desc"
      }
    })

    return sessions
  }

  static async getActiveSession(classroomId: string) {
    if (!classroomId) {
      throw new Error("Classroom ID is required")
    }

    const session = await prisma.liveSession.findFirst({
      where: {
        classroomId,
        status: "LIVE"
      }
    })

    return session
  }

}
