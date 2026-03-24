"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Label } from "@/components/label"
import { Textarea } from "@/components/textarea"
import { useInstructorStore } from "@/stores/instructorStore/useInstructorStore"
import toast from "react-hot-toast"
import { useRouter, useParams } from "next/navigation"
import { Upload, FileVideo, Image as ImageIcon } from "lucide-react"

export default function UploadVideoPage() {
  const router = useRouter()
  const params = useParams()
  const classroomId = params.classroomId as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)

  const { uploadVideo } = useInstructorStore()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
      } else {
        toast.error("Please upload a video file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
      } else {
        toast.error("Please upload a video file")
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImage(reader.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoFile) {
      toast.error("Please select a video file")
      return
    }
    
    if (!title.trim()) {
      toast.error("Please enter a video title")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("video", videoFile)
      formData.append("title", title.trim())
      formData.append("isLive", "false")
      if (description.trim()) {
        formData.append("description", description.trim())
      }
      if (coverImage) {
        formData.append("cover", coverImage)
      }

      await uploadVideo(classroomId, formData)
      
      // Reset form
      setTitle("")
      setDescription("")
      setVideoFile(null)
      setCoverImage("")
      
      // Optionally redirect to classroom page
      setTimeout(() => {
        router.push(`/class/${classroomId}`)
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Upload */}
            <div className="space-y-2">
              <Label htmlFor="video">Video File *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : videoFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                
                {videoFile ? (
                  <div className="space-y-2">
                    <FileVideo className="h-12 w-12 mx-auto text-green-600" />
                    <p className="font-medium text-green-900">{videoFile.name}</p>
                    <p className="text-sm text-green-700">{formatFileSize(videoFile.size)}</p>
                    <p className="text-xs text-green-600">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="font-medium text-gray-900">
                      Drag & drop your video here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse from your computer
                    </p>
                    <p className="text-xs text-gray-400">
                      Supported formats: MP4, AVI, MOV, WebM
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter video description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image (Optional)</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("cover")?.click()}
                    disabled={loading}
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {coverImage ? "Change Cover Image" : "Choose Cover Image"}
                  </Button>
                </div>
                {coverImage && (
                  <div className="relative h-16 w-16 rounded overflow-hidden border">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !videoFile || !title.trim()}
              className="w-full"
            >
              {loading ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
