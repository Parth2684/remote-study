"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Hls from "hls.js"
import { axiosInstance } from "@/lib/axiosInstance"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"

interface Video {
  id: string
  title: string
  link: string // MUST be master.m3u8
}

export default function VideoPage() {
  const { videoId } = useParams()
  const router = useRouter()
  const { authUser } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const initialRoute =
    authUser?.role === "INSTRUCTOR" ? "instructor" : "student"

  // 🎯 Fetch video
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.get(
          `${initialRoute}/classroom/video/${videoId}`
        )

        setVideo(res.data.video)
      } catch (err) {
        console.error(err)
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (videoId) fetchVideo()
  }, [videoId])

  // 🎬 Attach HLS
  useEffect(() => {
    if (!video || !videoRef.current) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls()

      hls.loadSource(video.link+"/master.m3u8") // 👈 master.m3u8
      hls.attachMedia(videoRef.current)
    } else if (
      videoRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      videoRef.current.src = video.link
    }

    return () => {
      hls?.destroy()
    }
  }, [video])

  if (loading || !video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">

      {/* 🎬 Video */}
      <video
        src={video.link+"/master.m3u8"}
        controls
        className="w-full max-h-[600px] bg-black rounded-lg"
      />

      {/* 📄 Info */}
      <div>
        <h1 className="text-xl font-semibold">{video.title}</h1>
      </div>

    </div>
  )
}