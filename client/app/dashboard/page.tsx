"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { redirect, useRouter } from "next/navigation"
import { BookOpen, Users, FileText, LogOut, Settings, Plus, Moon, Sun, UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { signoutAction } from "@/actions/signout"
import ClientAuthLoader from "@/components/client-auth-loader"

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()
  const { authUser, signout, checkAuth } = useAuthStore()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!authUser) {
      redirect("/signin"); 
    }

  }, [authUser]);

  const handleSignOut = () => {
    signoutAction()
    signout()
    router.push("/signin")
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  if (!authUser) {
    return (
      <ClientAuthLoader />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-neutral-300 dark:border-neutral-800 bg-background/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-foreground">EduLite</h1>
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push(authUser.role === "INSTRUCTOR" ? "/create-class" : "/join-class")}
                  >
                    {authUser.role === "INSTRUCTOR" ? "Create Class" : "Join Class"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full bg-primary select-none text-primary-foreground hover:bg-primary/90"
                  >
                    {getInitials(authUser.name)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
            <TabsTrigger className="" value="classes">My Classes</TabsTrigger>
            <TabsTrigger className="" value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {authUser.role === "INSTRUCTOR" ? "Active Classes" : "Enrolled Classes"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <p className="text-xs text-muted-foreground">
                    {authUser.role === "INSTRUCTOR" ? "+1 from last month" : "2 in progress"}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {authUser.role === "INSTRUCTOR" ? "Total Students" : "Completed Tasks"}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{authUser.role === "INSTRUCTOR" ? "45" : "12"}</div>
                  <p className="text-xs text-muted-foreground">
                    {authUser.role === "INSTRUCTOR" ? "Across all classes" : "This semester"}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {authUser.role === "INSTRUCTOR" ? "Content Created" : "Average Score"}
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{authUser.role === "INSTRUCTOR" ? "8" : "87%"}</div>
                  <p className="text-xs text-muted-foreground">
                    {authUser.role === "INSTRUCTOR" ? "This month" : "Last 5 activities"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Recent Activity
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  </CardTitle>
                  <CardDescription>Your latest classroom activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {authUser.role === "INSTRUCTOR" ? (
                      <>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Created new quiz: "JavaScript Fundamentals"</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Student Sarah completed Assignment 3</p>
                            <p className="text-xs text-muted-foreground">5 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New student joined "General Science"</p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Completed quiz: "JavaScript Fundamentals"</p>
                            <p className="text-xs text-muted-foreground">Score: 92% • 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Submitted Assignment 3</p>
                            <p className="text-xs text-muted-foreground">General Science • 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Joined new course: "English Language"</p>
                            <p className="text-xs text-muted-foreground">3 days ago</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push("/class/1")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">General Science</CardTitle>
                  <CardDescription>
                    {authUser.role === "INSTRUCTOR" ? "25 students enrolled" : "Instructor: Sir John Doe"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Active</Badge>
                    <Button size="sm">Enter Class</Button>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push("/class/2")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">English Language</CardTitle>
                  <CardDescription>
                    {authUser.role === "INSTRUCTOR" ? "12 students enrolled" : "Instructor: Prof. Johnson"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Active</Badge>
                    <Button size="sm">Enter Class</Button>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push("/class/3")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Mathematics</CardTitle>
                  <CardDescription>
                    {authUser.role === "INSTRUCTOR" ? "8 students enrolled" : "Instructor: Dr. Wilson"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Completed</Badge>
                    <Button size="sm" variant="outline">
                      View Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}