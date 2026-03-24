/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Badge } from "@/components/badge"
import { useParams } from "next/navigation"
import { ArrowLeft, Users, BookOpen, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axiosInstance"
import { Sessions } from "@/components/sessions"
import { DiscussionTab } from "@/components/discussion-tab"
import { QuizSection } from "@/components/quiz-section"

// Define the interface for quiz data
interface Quiz {
  id: string;
  title: string;
  description: string;
  attempts?: number;
}

// Define the interface for class data
interface ClassData {
  name: string;
  instructor: string;
  description: string;
  students: number;
  code: string;
  quizzes: Quiz[];
}

export default function ClassPage() {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const classId = Array.isArray(params.id) ? params.id[0] : params.id
  const { authUser } = useAuthStore()
  const router = useRouter()

  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId || !authUser) return

      try {
        setLoading(true)
        setError(null)

        const endpoint =
          authUser.role === "INSTRUCTOR"
            ? `/instructor/classroom/${classId}`
            : `/student/classroom/${classId}`

        const res = await axiosInstance.get(endpoint)
        const classroom = res.data.classroom

        setClassData({
          name: classroom.name,
          description: classroom.description,
          instructor: classroom.instructor.name,
          students: classroom.students.length,
          code: classroom.id,
          quizzes: classroom.quizzes.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            attempts: quiz.attempts ?? 0,
            attempted: quiz.attempted,
            attemptId: quiz.attemptId
          })),
        })
      } catch (err) {
        console.error("Error fetching class data:", err)
        setError("Failed to load class data")
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [classId, authUser])


  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Please log in to view this page</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">{error || 'Class not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{classData.name}</h1>
              <p className="text-muted-foreground mb-4">{classData.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{classData.students} {classData.students === 1 ? 'student' : 'students'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Code: {classData.code}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {classData.students > 0 ? 'Active' : 'No Students'}
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="Sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="Sessions">Sessions</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({classData.quizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="mt-6">
            {classId && <DiscussionTab classId={classId} />}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="space-y-6">
              {authUser?.role === 'INSTRUCTOR' && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => router.push(`/create-quiz`)}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Create Quiz
                  </Button>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Quizzes
                      </CardTitle>
                      <CardDescription>Test your knowledge with quizzes</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {classData.quizzes.length} {classData.quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </Badge>
                  </div>
                </CardHeader>
                <QuizSection quizzes={classData.quizzes} />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="Sessions">
            <Sessions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}