"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { redirect, useParams } from "next/navigation"
import { ArrowLeft, Users, MessageCircle, Video, BookOpen, Calendar, Clock, Edit } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useRouter } from "next/navigation"

export default function ClassPage() {
  const params = useParams()
  const classId = Array.isArray(params.id) ? params.id[0] : params.id
  const { authUser, checkAuth } = useAuthStore()
  const router = useRouter()

  // Mock class data - in real app this would come from API
  const classData = {
    1: {
      name: "General Science",
      instructor: "Sir John Doe",
      description: "Learn the fundamentals of General Science",
      students: 25,
      code: "GEN101",
      schedule: "Mon, Wed, Fri - 10:00 AM",
    },
    2: {
      name: "English Language",
      instructor: "Prof. Johnson",
      description: "Master English Language",
      students: 12,
      code: "ENG202",
      schedule: "Tue, Thu - 2:00 PM",
    },
    3: {
      name: "Mathematics",
      instructor: "Dr. Wilson",
      description: "Learn Mathematics",
      students: 8,
      code: "MATH301",
      schedule: "Mon, Wed - 3:00 PM",
    },
  }

  const quizzes = [
    { id: 1, title: "HTML Basics", attempts: 5 },
    { id: 2, title: "CSS Fundamentals", attempts: 2 },
    { id: 3, title: "JavaScript Essentials", attempts: 8 },
  ]

  const classIdNumber = Number(classId);

  if (isNaN(classIdNumber) || !classData[classIdNumber]) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Class not found</div>
      </div>
    );
  }

  // Now it's safe to use classIdNumber as the index
  const currentClass = classData[classIdNumber];


  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!authUser) {
      redirect("/signin"); 
    }
  }, [authUser]);

  if (!authUser || !currentClass) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Class not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{currentClass.name}</h1>
              <p className="text-muted-foreground mb-4">{currentClass.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{currentClass.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentClass.schedule}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Code: {currentClass.code}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="sessions">Videos/Sessions</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Class Discussions
                  </CardTitle>
                  <CardDescription>Participate in class discussions and ask questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          DS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Dr. Smith</span>
                            <Badge variant="secondary" className="text-xs">
                              Instructor
                            </Badge>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-sm mb-2">
                            Welcome to Web Development 101! Please introduce yourselves and share what you hope to learn
                            in this course.
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>5 replies</span>
                            <span>12 likes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          SJ
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Sarah Johnson</span>
                            <Badge variant="outline" className="text-xs">
                              Student
                            </Badge>
                            <span className="text-xs text-muted-foreground">1 day ago</span>
                          </div>
                          <p className="text-sm mb-2">
                            Hi everyone! I'm Sarah and I'm excited to learn web development. I have some experience with
                            HTML but I'm new to JavaScript.
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>2 replies</span>
                            <span>8 likes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                          MR
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Mike Rodriguez</span>
                            <Badge variant="outline" className="text-xs">
                              Student
                            </Badge>
                            <span className="text-xs text-muted-foreground">1 day ago</span>
                          </div>
                          <p className="text-sm mb-2">
                            Question about the first assignment - should we use vanilla JavaScript or can we use
                            libraries?
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>1 reply</span>
                            <span>3 likes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {authUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Share your thoughts or ask a question..."
                          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm">Post</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Sessions
                  </CardTitle>
                  <CardDescription>Access recorded sessions and upcoming live classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Introduction to HTML</h3>
                            <p className="text-sm text-muted-foreground">Recorded session • 45 minutes</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Dec 15, 2024</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Watch
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">CSS Fundamentals</h3>
                            <p className="text-sm text-muted-foreground">Recorded session • 52 minutes</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Dec 17, 2024</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Watch
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">JavaScript Basics</h3>
                            <p className="text-sm text-muted-foreground">Live session • Tomorrow at 10:00 AM</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Dec 20, 2024</span>
                              <Badge variant="secondary" className="text-xs">
                                Upcoming
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">Join Live</Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">DOM Manipulation</h3>
                            <p className="text-sm text-muted-foreground">Scheduled • Next week</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Dec 22, 2024</span>
                              <Badge variant="outline" className="text-xs">
                                Scheduled
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" disabled>
                          Not Available
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="space-y-6">
              {authUser.role === 'INSTRUCTOR' && (
                <div className="mb-4">
                  <Button variant="default" onClick={() => router.push(`/quiz/create?classId=${classIdNumber}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>Attempts: {quiz.attempts}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/quiz/${quiz.id}`)}
                      >
                        Attempt Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}