"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, Plus, Moon, Sun, UserIcon, LogOut, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { Skeleton } from "@/components/ui/skeleton"

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { authUser, signout, isSigningOut, isCheckingAuth, checkAuth } = useAuthStore()

  const hideNavbarRoutes = ['/signin', '/signup', '/forgot-password']
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname)

  useEffect(() => {
    // Check if we're on the client side
    setIsHydrated(true)
    
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    if (isHydrated) {
      checkAuth()
    }
  }, [isHydrated, checkAuth])

  const handleSignOut = () => {
    signout()
    router.push("/")
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

  if (shouldHideNavbar) {
    return null
  }

  if (!isHydrated || isCheckingAuth) {
    return (
      <nav className="border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-md bg-background/80 dark:bg-background/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - always show */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground select-none">EduLite</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Plus className="size-4 rounded-md animate-pulse" />
              <Sun className="size-4 rounded-md animate-pulse" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-md bg-background/60 dark:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={authUser ? "/dashboard" : "/"} className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground select-none">EduLite</span>
          </Link>

          <div className="flex items-center space-x-3">
            {authUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {authUser.role === "INSTRUCTOR" ? (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/create-class")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Class
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/create-quiz")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/create-assignment")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/join-class")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Join Class
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User menu or auth buttons */}
            {authUser ? (
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
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-3 py-2 border-b dark:border-b-neutral-800">
                    <p className="font-medium text-sm">{authUser.name}</p>
                    <p className="text-xs text-muted-foreground">{authUser.email}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {authUser.role === "INSTRUCTOR" ? "Instructor" : "Student"}
                    </Badge>
                  </div>

                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  
                  {/* Role-specific menu items */}
                  {authUser.role === "INSTRUCTOR" && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/analytics")}>
                        📊 Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/manage-students")}>
                        👥 Manage Students
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {authUser.role === "STUDENT" && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/grades")}>
                        📝 My Grades
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/schedule")}>
                        📅 Class Schedule
                      </DropdownMenuItem>
                    </>
                  )}

                  <div className="border-t dark:border-t-neutral-800">
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="text-red-600 dark:text-red-500 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="gradient-purple text-white border-0 hover:opacity-90">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation - only show for authenticated users */}
        {authUser && (
          <div className="md:hidden border-t border-border/40 py-2">
            <div className="flex items-center justify-around text-center">
              <Link 
                href="/dashboard" 
                className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                  pathname === '/dashboard' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/classes" 
                className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                  pathname === '/classes' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Classes
              </Link>
              
              {authUser.role === "INSTRUCTOR" ? (
                <>
                  <Link 
                    href="/analytics" 
                    className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                      pathname === '/analytics' 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Analytics
                  </Link>
                  <Link 
                    href="/create-content" 
                    className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                      pathname === '/create-content' 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Create
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/assignments" 
                    className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                      pathname === '/assignments' 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tasks
                  </Link>
                  <Link 
                    href="/grades" 
                    className={`flex-1 text-xs font-medium py-2 px-1 transition-colors ${
                      pathname === '/grades' 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Grades
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}