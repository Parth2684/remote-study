"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Hls from "hls.js";
import { axiosInstance } from "@/lib/axiosInstance";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore/useAuthStore";

interface Video {
  id: string;
  title: string;
  description: string | null;
  link: string;
  originalSize: number; // bytes
  sdSize: number | null; // MB
  hdSize: number | null; // MB
  fhdSize: number | null; // MB
}

type Quality = "auto" | "576" | "720" | "1080";

export default function VideoPage() {
  const { videoId } = useParams();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState<Quality>("auto");

  const initialRoute =
    authUser?.role === "INSTRUCTOR" ? "instructor" : "student";

  // 🎯 Fetch video
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.get(
          `${initialRoute}/classroom/video/${videoId}`
        );
        setVideo(res.data.video);
      } catch (err) {
        console.error(err);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchVideo();
  }, [videoId, initialRoute]);

  // 🎬 Attach HLS (WITH QUALITY SWITCHING)
  useEffect(() => {
    if (!video || !videoRef.current) return;

    const videoEl = videoRef.current;

    let src = `${video.link}/master.m3u8`;

    if (quality === "576") src = `${video.link}/v0/stream.m3u8`;
    if (quality === "720") src = `${video.link}/v1/stream.m3u8`;
    if (quality === "1080") src = `${video.link}/v2/stream.m3u8`;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(() => {});
      });
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.src = src;
      videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play().catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [video, quality]);

  // 📦 helpers
  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (loading || !video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* 🎬 Video */}
      <video
        ref={videoRef}
        controls
        className="w-full max-h-[600px] bg-black rounded-lg"
      />

      {/* 🎚️ Quality Selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setQuality("auto")}
          className={`px-3 py-1 rounded ${
            quality === "auto" ? "bg-blue-500 text-white" : "bg-gray-800"
          }`}
        >
          Auto
        </button>

        {video.sdSize && (
          <button
            onClick={() => setQuality("576")}
            className={`px-3 py-1 rounded ${
              quality === "576" ? "bg-blue-500 text-white" : "bg-neutral-200"
            }`}
          >
            576p (SD)
          </button>
        )}

        {video.hdSize && (
          <button
            onClick={() => setQuality("720")}
            className={`px-3 py-1 rounded ${
              quality === "720" ? "bg-blue-500 text-white" : "bg-neutral-200"
            }`}
          >
            720p (HD)
          </button>
        )}

        {video.fhdSize && (
          <button
            onClick={() => setQuality("1080")}
            className={`px-3 py-1 rounded ${
              quality === "1080" ? "bg-blue-500 text-white" : "bg-neutral-200"
            }`}
          >
            1080p (FHD)
          </button>
        )}
      </div>

      {/* 📄 Info */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">{video.title}</h1>

        {video.description && (
          <p className="text-gray-600">{video.description}</p>
        )}

        {/* 📊 Sizes */}
        {/* <div className="text-sm text-gray-500 space-y-1">
          <p>Original: {formatBytes(video.originalSize)}</p>

          {video.sdSize && <p>576p: {video.sdSize} MB</p>}
          {video.hdSize && <p>720p: {video.hdSize} MB</p>}
          {video.fhdSize && <p>1080p: {video.fhdSize} MB</p>}
        </div> */}
      </div>
    </div>
  );
}