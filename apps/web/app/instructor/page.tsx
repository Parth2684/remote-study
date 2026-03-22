"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { useInstructorStore } from "@/stores/instructorStore/useInstructorStore"
import { Plus, Upload, Play, BookOpen } from "lucide-react"
import toast from "react-hot-toast"

interface Classroom {
  id: string
  name: string
  description?: string
  _count?: {
    videos: number
    students: number
  }
}

export default function InstructorPage() {
  const { classrooms, getClassrooms } = useInstructorStore()

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        await getClassrooms()
      } catch (error) {
        toast.error("Failed to fetch classrooms")
      }
    }

    fetchClassrooms()
  }, [getClassrooms])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your classrooms and content</p>
        </div>
        <Button asChild>
          <Link href="/instructor/classroom/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Classroom
          </Link>
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No classrooms yet</h2>
            <p className="text-muted-foreground mb-4">Create your first classroom to start uploading videos</p>
            <Button asChild>
              <Link href="/instructor/classroom/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Classroom
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom: Classroom) => (
            <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{classroom.name}</span>
                  <div className="flex gap-1">
                    {classroom._count?.videos !== undefined && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {classroom._count.videos} videos
                      </span>
                    )}
                  </div>
                </CardTitle>
                {classroom.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classroom.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/instructor/classroom/${classroom.id}/upload-video`}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/instructor/classroom/${classroom.id}/create-quiz`}>
                      <Play className="h-4 w-4 mr-2" />
                      Create Quiz
                    </Link>
                  </Button>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/class/${classroom.id}`}>
                    View Classroom
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
