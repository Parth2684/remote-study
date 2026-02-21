"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import { Loader2, Video, Clock } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { axiosInstance } from "@/lib/axiosInstance"
import { useParams, useRouter } from "next/navigation"

interface LiveSession {
  id: string
  title: string
  startedAt: string
  endedAt: string | null
  status: "LIVE" | "ENDED"
}

export const Sessions = () => {
  const { authUser } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const classId = Array.isArray(params.id) ? params.id[0] : params.id

  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)

        const initialRoute = authUser?.role === "INSTRUCTOR" ? "instructor" : "student"

        const [allRes, activeRes] = await Promise.all([
          axiosInstance.get(`/${initialRoute}/classroom/live/${classId}/sessions`),
          axiosInstance.get(`/${initialRoute}/classroom/live/${classId}/active`)
        ])

        setSessions(allRes.data.sessions || [])
        setActiveSession(activeRes.data.session || null)

      } catch (err) {
        console.error("Error fetching sessions:", err)
      } finally {
        setLoading(false)
      }
    }

    if (classId) fetchSessions()
  }, [classId, authUser?.role])

  const handleStartSession = async () => {
    try {
      setStarting(true)

      const res = await axiosInstance.post("/live/start", {
        classroomId: classId,
        title: `Live Session - ${new Date().toLocaleString()}`
      })

      const { token, roomName } = res.data

      // Redirect to live page
      router.push(`/live/${roomName}?token=${token}`)

    } catch (err) {
      console.error("Error starting session:", err)
    } finally {
      setStarting(false)
    }
  }

  const handleJoinLive = () => {
    if (!activeSession) return
    router.push(`/live/${activeSession.id}`)
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Instructor Start Button */}
      {authUser?.role === "INSTRUCTOR" && (
        <div className="flex justify-end">
          <Button onClick={handleStartSession} disabled={starting}>
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Video className="h-4 w-4 mr-2" />
            )}
            Start New Session
          </Button>
        </div>
      )}

      {/* Student Live Banner */}
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

      {/* Previous Sessions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Previous Sessions</h2>

        {sessions.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No previous sessions yet.
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {session.title}
                  </CardTitle>
                  {session.status === "LIVE" && (
                    <Badge className="bg-red-600 text-white">LIVE</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {formatTime(session.startedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                {session.status === "LIVE" ? (
                  <Button onClick={() => router.push(`/live/${session.id}`)}>
                    Join
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Ended
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}