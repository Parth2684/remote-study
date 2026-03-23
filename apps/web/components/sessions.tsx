"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import { Loader2, Video, Clock, Plus } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { axiosInstance } from "@/lib/axiosInstance"
import { StartLiveModal } from "@/components/start-live-modal"
import { useParams, useRouter } from "next/navigation"

interface LiveSession {
  id: string
  roomName: string
  title: string
  startedAt: string
  endedAt: string | null
  status: "LIVE" | "ENDED"
}

interface VideoType {
  id: string
  title: string
  link: string
  isLive: boolean
  uploadedAt: string
}

export const Sessions = () => {
  const { authUser } = useAuthStore()
  const params = useParams()
  const router = useRouter()

  const classId = Array.isArray(params.id) ? params.id[0] : params.id

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")

  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)

  const [videos, setVideos] = useState<VideoType[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null)
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "UPLOADED">("ALL")

  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  const initialRoute =
    authUser?.role === "INSTRUCTOR" ? "instructor" : "student"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [sessionsRes, activeRes, videosRes] = await Promise.all([
          axiosInstance.get(
            `/${initialRoute}/classroom/live/${classId}/sessions`
          ),
          axiosInstance.get(
            `/${initialRoute}/classroom/live/${classId}/active`
          ),
          axiosInstance.get(
            `/${initialRoute}/classroom/videos/${classId}`
          )
        ])

        setSessions(sessionsRes.data.sessions || [])
        setActiveSession(activeRes.data.session || null)
        setVideos(videosRes.data.videos || [])

      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (classId) fetchData()
  }, [classId, authUser?.role])

  const handleStartSession = async (title: string) => {
    try {
      setStarting(true)

      const res = await axiosInstance.post(
        `/${initialRoute}/classroom/live/start`,
        {
          classroomId: classId,
          title,
          roomName: title
        }
      )

      const { liveSession, token, roomName } = res.data

      setIsModalOpen(false)

      router.push(
        `/live/${roomName}?token=${token}&sessionId=${liveSession.id}`
      )

    } catch (err) {
      console.error("Error starting session:", err)
    } finally {
      setStarting(false)
    }
  }

  const handleJoinLive = () => {
    if (!activeSession) return
    router.push(
      `/live/${activeSession.roomName}?sessionId=${activeSession.id}`
    )
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleString()

  const filteredVideos = videos.filter((video) => {
    if (filter === "LIVE") return video.isLive
    if (filter === "UPLOADED") return !video.isLive
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {authUser?.role === "INSTRUCTOR" && (
        <div className="flex justify-end gap-4">
          <Button
            onClick={() =>
              router.push(
                `/instructor/classroom/${classId}/upload-video`
              )
            }
          >
            <Plus /> Upload Session
          </Button>

          <Button onClick={() => setIsModalOpen(true)}>
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Video className="h-4 w-4 mr-2" />
            )}
            Start New Session
          </Button>
        </div>
      )}

      {authUser?.role === "STUDENT" && activeSession && (
        <Card className="border-red-400 bg-red-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-red-600" />
                {activeSession.title}
              </CardTitle>
              <Badge className="bg-red-600 text-white animate-pulse">
                LIVE
              </Badge>
            </div>
            <CardDescription>
              Started at {formatTime(activeSession.startedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleJoinLive}>
              Join Live Session
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Class Videos</h2>

        {/* FILTERS */}
        <div className="flex gap-3">
          {["ALL", "LIVE", "UPLOADED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* VIDEO PREVIEW */}
        {selectedVideo && (
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={selectedVideo.link}
              controls
              className="w-full h-[400px]"
            />
            <div className="p-3 text-white">
              {selectedVideo.title}
            </div>
          </div>
        )}

        {/* VIDEO GRID */}
        {filteredVideos.length === 0 ? (
          <div>No videos found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => router.push(`/video/${video.id}`)}
                className="border rounded-lg p-3 cursor-pointer hover:shadow"
              >
                <div className="h-40 bg-gray-300 rounded mb-2 flex items-center justify-center">
                  🎬
                </div>

                <div className="font-medium">
                  {video.title}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(video.uploadedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>

                <div className="mt-2">
                  {video.isLive ? (
                    <span className="text-red-600 font-semibold">
                      LIVE RECORDING
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      UPLOADED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold">Previous Sessions</h2>

        {sessions.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No previous sessions yet.
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{session.title}</CardTitle>
                  {session.status === "LIVE" && (
                    <Badge className="bg-red-600 text-white">
                      LIVE
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {formatTime(session.startedAt)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div> */}

      <StartLiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartSession}
        loading={starting}
        title={title}
        setTitle={setTitle}
      />
    </div>
  )
}