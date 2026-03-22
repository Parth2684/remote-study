"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import {
  LiveKitRoom,
  VideoConference,
  useRoomContext
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { axiosInstance } from "@/lib/axiosInstance"

function LiveRoomInner({
  authUser,
  sessionId,
  onLeave
}: {
  authUser: any
  sessionId: string | null
  onLeave: () => void
}) {
  const room = useRoomContext()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)

  // ✅ Enable camera + mic properly
  useEffect(() => {
    if (!room) return

    const enableMedia = async () => {
      try {
        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
      } catch (err) {
        console.error("Media error:", err)
      }
    }

    enableMedia()
  }, [room])

  // 🎥 START RECORDING (screen + mic)
  const startRecording = async () => {
    try {
      if (!room) return

      // screen video only
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      const tracks: MediaStreamTrack[] = []

      // add screen
      screenStream.getVideoTracks().forEach((t) => tracks.push(t))

      // add mic ONLY if enabled
      room.localParticipant.audioTrackPublications.forEach((pub) => {
        if (pub.track?.mediaStreamTrack) {
          tracks.push(pub.track.mediaStreamTrack)
        }
      })

      if (tracks.length === 0) {
        alert("Enable mic first")
        return
      }

      const stream = new MediaStream(tracks)
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        try {
          setUploading(true)

          const blob = new Blob(chunksRef.current, {
            type: "video/webm"
          })

          chunksRef.current = []

          const formData = new FormData()
          formData.append("video", blob, "recording.webm")
          formData.append("sessionId", sessionId || "")

          await axiosInstance.post(
            "/instructor/classroom/live/upload-recording",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          )

        } catch (err) {
          console.error(err)
        } finally {
          setUploading(false)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)

    } catch (err) {
      console.error("Recording error:", err)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="relative h-full">

      {/* 🎥 Recording Controls */}
      {authUser?.role === "INSTRUCTOR" && (
        <div className="absolute top-4 right-4 z-50 flex gap-3">

          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded text-white ${
              recording ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>

          {uploading && (
            <span className="text-white text-sm">Uploading...</span>
          )}
        </div>
      )}

      <VideoConference />
    </div>
  )
}

export default function LiveRoomPage() {
  const { authUser } = useAuthStore()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomName = params.roomName as string
  const tokenFromQuery = searchParams.get("token")
  const sessionId = searchParams.get("sessionId")

  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomName || !authUser) return

    const init = async () => {
      try {
        let finalToken = tokenFromQuery

        if (!finalToken) {
          const roleRoute =
            authUser.role === "INSTRUCTOR" ? "instructor" : "student"

          const res = await axiosInstance.post(
            `/${roleRoute}/classroom/live/join`,
            { sessionId }
          )

          finalToken = res.data.token
        }

        setToken(finalToken!)
        setLoading(false)

      } catch (err) {
        console.error(err)
        router.back()
      }
    }

    init()
  }, [roomName, authUser, tokenFromQuery])

  const handleDisconnected = async () => {
    try {
      if (authUser?.role === "INSTRUCTOR" && sessionId) {
        await axiosInstance.put(
          `/instructor/classroom/live/end/${sessionId}`
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      router.back()
    }
  }

  if (loading || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        data-lk-theme="default"
        onDisconnected={handleDisconnected}
      >
        <LiveRoomInner
          authUser={authUser}
          sessionId={sessionId}
          onLeave={handleDisconnected}
        />
      </LiveKitRoom>
    </div>
  )
}