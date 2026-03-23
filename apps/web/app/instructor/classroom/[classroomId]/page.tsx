"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { useInstructorStore } from "@/stores/instructorStore/useInstructorStore"
import { Upload, Play, ArrowLeft, Users, Video, BookOpen } from "lucide-react"
import toast from "react-hot-toast"
import { axiosInstance } from "@/lib/axiosInstance"

interface Classroom {
  id: string
  name: string
  description?: string
  _count?: {
    videos: number
    students: number
  }
}

interface VideoContent {
  id: string
  title: string
  description?: string
  link: string
  isLive: boolean
  createdAt: string
  mediaInfo?: {
    width: number
    height: number
    fps: number
    hasAudio: boolean
  }
}

export default function ClassroomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const classroomId = params.classroomId as string

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [loading, setLoading] = useState(true)

  const { classrooms } = useInstructorStore()

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        setLoading(true)
        
        // Get classroom details
        const classroomRes = await axiosInstance.get(`/instructor/classroom/${classroomId}`)
        setClassroom(classroomRes.data.classroom)

        // Get classroom videos
        try {
          const videosRes = await axiosInstance.get(`/instructor/classroom/${classroomId}/videos`)
          console.log("Videos API response:", videosRes.data)
          const videosData = videosRes.data
          // Handle different response structures
          const videosArray = Array.isArray(videosData) ? videosData : (videosData.videos || [])
          console.log("Videos array:", videosArray)
          setVideos(videosArray)
        } catch (videoError) {
          console.error("Failed to fetch videos:", videoError)
          setVideos([]) // Set empty array on error
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch classroom data")
      } finally {
        setLoading(false)
      }
    }

    if (classroomId) {
      fetchClassroomData()
    }
  }, [classroomId, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Classroom not found</h1>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{classroom.name}</h1>
            {classroom.description && (
              <p className="text-muted-foreground mt-2">{classroom.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/instructor/classroom/${classroomId}/upload-video`}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/instructor/classroom/${classroomId}/create-quiz`}>
                <Play className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">{videos.length}</span>
            <span className="text-muted-foreground">Videos</span>
          </div>
          {classroom._count?.students !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{classroom._count.students}</span>
              <span className="text-muted-foreground">Students</span>
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Videos</h2>
          <Button asChild size="sm">
            <Link href={`/instructor/classroom/${classroomId}/upload-video`}>
              <Upload className="h-4 w-4 mr-2" />
              Add Video
            </Link>
          </Button>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Video className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
              <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
              <Button asChild>
                <Link href={`/instructor/classroom/${classroomId}/upload-video`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(videos) && videos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{video.title}</span>
                    {video.isLive && (
                      <Badge variant="destructive" className="text-xs">
                        LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {video.mediaInfo && (
                      <div className="text-xs text-muted-foreground">
                        {video.mediaInfo.width}x{video.mediaInfo.height} • {video.mediaInfo.fps}fps
                        {video.mediaInfo.hasAudio && " • Audio"}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Uploaded {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                    <Button size="sm" className="w-full" disabled>
                      {video.link === "pending" ? "Processing..." : "View Video"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
