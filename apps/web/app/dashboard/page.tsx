"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { BookOpen, Users, FileText, Loader2, PenSquare } from "lucide-react"
import { useAuthStore } from "../../stores/authStore/useAuthStore"
import ClientAuthLoader from "../../components/client-auth-loader"
import { axiosInstance } from "../../lib/axiosInstance"

// Note: This JSON is updated to reflect the Prisma schema.
// It is used as fallback data if no classrooms are found for the user.
let classroomsjson = {
  "message": "Sample classrooms fetched successfully",
  "classrooms": [
    {
      "id": "1",
      "name": "General Science",
      "instructorName": "Sir John Doe",
      "studentsCount": 25
    },
    {
      "id": "2",
      "name": "English Language",
      "instructorName": "Prof. Johnson",
      "studentsCount": 12
    },
    {
      "id": "3",
      "name": "Advanced Mathematics",
      "instructorName": "Dr. Wilson",
      "studentsCount": 8
    },
    {
      "id": "4",
      "name": "Intro to Programming",
      "instructorName": "Ms. Tech",
      "studentsCount": 18
    }
  ]
}

export default function DashboardPage() {
  const { authUser } = useAuthStore()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch classrooms from API
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true)
        setError(null) // Reset error state on new fetch

        const role = authUser?.role
        const endpoint = role === "INSTRUCTOR" ? '/instructor/classroom' : '/student/classroom'
        const response = await axiosInstance.get(endpoint)
        
        const data = await response.data
        
        if (response.status === 200) {
          const classroomsData = Array.isArray(data.classrooms) ? data.classrooms : []
          setClassrooms(classroomsData) // Assuming data is pre-sorted or order doesn't matter
        } else {
          setError(data.message || 'Failed to fetch classrooms')
        }
      } catch (err: any) {
        console.error('Error fetching classrooms:', err)
        if (err.response) {
          if (err.response.status === 500) {
            setError('An internal server error occurred. Please try again later.')
          } else if (err.response.status === 404) {
            setClassrooms([])
          } else {
            setError(err.response.data.message || `An error occurred: ${err.response.status}`)
          }
        } else if (err.request) {
          setError('Network error. Could not connect to the server.')
        } else {
          setError('An unexpected error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchClassrooms()
    }
  }, [authUser])

  if (!authUser) {
    return <ClientAuthLoader />
  }

  // Determine which classroom data to display. If the fetched data is empty (and not loading/error), use the JSON fallback.
  const classroomsToDisplay = !loading && classrooms.length === 0 && !error
    ? classroomsjson.classrooms
    : classrooms;
    
  const uniqueInstructorsCount = new Set(classroomsToDisplay.map(c => c.instructorName)).size;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-neutral-50 dark:bg-neutral-950/70 min-h-[calc(100vh-4.05rem)]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {authUser.name}!</h2>
          <p className="text-muted-foreground">
            {authUser.role === "INSTRUCTOR"
              ? "Manage your classrooms and create engaging content for your students."
              : "Access your courses and track your learning progress."}
          </p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-neutral-800">
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {authUser.role === "INSTRUCTOR" ? "Total Classes" : "Enrolled Classes"}
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : classroomsToDisplay.length}
                  </div>
                   <p className="text-xs text-muted-foreground">
                    {authUser.role === "INSTRUCTOR" ? "Ready to manage" : "Ready to explore"}
                  </p>
                </CardContent>
              </Card>

              {authUser.role === "INSTRUCTOR" ? (
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? "..." : classroomsToDisplay.reduce((sum, c) => sum + (c.studentsCount || 0), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all your classes</p>
                  </CardContent>
                </Card>
              ) : (
                 <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Instructors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? "..." : uniqueInstructorsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Guiding your learning journey</p>
                  </CardContent>
                </Card>
              )}

              {authUser.role === "INSTRUCTOR" && (
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content Created</CardTitle>
                    <PenSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{loading ? "..." : "8"}</div>
                    <p className="text-xs text-muted-foreground">Quizzes and assignments</p>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Recent Activity Card remains the same as it uses static data */}
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading classrooms...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classroomsToDisplay.map((classroom) => (
                  <Card
                    key={classroom.id}
                    className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => window.location.href = `/class/${classroom.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{classroom.name}</CardTitle>
                      <CardDescription>
                        {authUser.role === "INSTRUCTOR" 
                          ? `${classroom.studentsCount || 0} students enrolled`
                          : `Instructor: ${classroom.instructorName || 'Unknown'}`
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <Button size="sm">Open</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

