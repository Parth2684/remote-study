import { Request, RequestHandler, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { prisma } from "@repo/db"

// 📁 Create uploads folder if not exists
const uploadDir = path.join(process.cwd(), "uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 📦 Multer config (store on disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

export const uploadRecordingHandler: RequestHandler[] = [
  upload.single("video"),

  async (req: Request, res: Response) => {
    try {
      const file = req.file
      const { sessionId } = req.body

      if (!file) {
        return res.status(400).json({ msg: "No file uploaded" })
      }

      // 🔍 get session → to get classroomId
      const session = await prisma.liveSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        return res.status(404).json({ msg: "Session not found" })
      }

      // 📦 Save in DB (minimal fields)
      const video = await prisma.video.create({
        data: {
          name: file.filename,
          title: `Recording - ${new Date().toLocaleString()}`,
          link: `/uploads/${file.filename}`, // local path
          classroomId: session.classroomId,
          mediaInfo: {},
          isLive: true,
          status: "SUCCESS"
        }
      })

      return res.json({
        msg: "Recording uploaded successfully",
        video
      })

    } catch (err) {
      console.error("Upload error:", err)
      res.status(500).json({ msg: "Upload failed" })
    }
  }
]