"use client"

import { useEffect, useState } from "react"
import { Button } from "@repo/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Badge } from "@repo/ui/badge"
import { useParams } from "next/navigation"
import { ArrowLeft, Users, MessageCircle, BookOpen, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/fetch-class/${classId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch class data')
        }
        
        const data = await response.json()
        setClassData({
          ...data,
          quizzes: Array.isArray(data.quizzes) 
            ? data.quizzes.map((quiz: Quiz) => ({
                ...quiz,
                attempts: quiz.attempts || 0
              }))
            : []
        })
      } catch (err) {
        console.error('Error fetching class data:', err)
        setError('Failed to load class data')
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [classId])

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
                <div className="flex items-center gap-1">
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
        
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({classData.quizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Class Discussions
                  </CardTitle>
                  <CardDescription>Join the conversation with your classmates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Welcome to the class!</h3>
                            <span className="text-xs text-muted-foreground">2h ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Let's introduce ourselves to the class...
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>12 replies</span>
                            <span>•</span>
                            <span>Last reply 1h ago</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <MessageCircle className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Question about the assignment</h3>
                            <span className="text-xs text-muted-foreground">1d ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            I'm having trouble with question 3. Can anyone help?
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>5 replies</span>
                            <span>•</span>
                            <span>Last reply 3h ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="space-y-6">
              {authUser?.role === 'INSTRUCTOR' && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => router.push(`/quiz/create?classId=${classId}`)}
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
                        Quizzes & Assignments
                      </CardTitle>
                      <CardDescription>Test your knowledge with quizzes and assignments</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {classData.quizzes.length} {classData.quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.quizzes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="font-medium">No quizzes available yet</p>
                      <p className="text-sm">
                        {authUser?.role === 'INSTRUCTOR' 
                          ? 'Create your first quiz to get started' 
                          : 'Check back later for available quizzes'}
                      </p>
                      {authUser?.role === 'INSTRUCTOR' && (
                        <Button 
                          onClick={() => router.push(`/quiz/create?classId=${classId}`)}
                          className="mt-4"
                        >
                          Create Quiz
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {classData.quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            {quiz.description && (
                              <CardDescription className="line-clamp-2">
                                {quiz.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                {quiz.attempts !== undefined && (
                                  <span>{quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}</span>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => router.push(`/quiz/${quiz.id}`)}
                              >
                                {authUser?.role === 'INSTRUCTOR' ? 'View' : 'Start'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}