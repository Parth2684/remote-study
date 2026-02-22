"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { axiosInstance } from "@/lib/axiosInstance"

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

        // If no token in query → fetch (student case)
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
        console.error("Failed to get token:", err)
        router.back()
      }
    }

    init()
  }, [roomName, authUser])

  const handleDisconnected = async () => {
    console.log("Disconnecting...")
    console.log("auth user: ", authUser)
    console.log("session id: ", sessionId)
    try {
      if (authUser?.role === "INSTRUCTOR" && sessionId) {
        console.log("Ending live session")
        const res = await axiosInstance.put(
          `/instructor/classroom/live/end/${sessionId}`
        )

        console.log("res: ", res)
      }
    } catch (err) {
      console.error("Error ending session:", err)
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
    <div className="h-[calc(100vh-5rem)]">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        data-lk-theme="default"
        onDisconnected={handleDisconnected}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}