"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore/useAuthStore"


export default function SignInPage() {
  const [error, setError] = useState("")
  const { signin, authUser, isSigningIn, checkAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, role: "STUDENT" | "INSTRUCTOR") => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    signin({ email, password, role })
  }

  useEffect(() => {
    checkAuth()
    if (authUser) {
      redirect("/dashboard")
    }
  }, [authUser, checkAuth])

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Choose your role and sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 dark:bg-neutral-800">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={(e) => handleSubmit(e, "STUDENT")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input id="student-email" name="email" type="email" placeholder="student@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" name="password" type="password" required />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isSigningIn}>
                  {isSigningIn ? "Signing in..." : "Sign In as Student"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="instructor">
              <form onSubmit={(e) => handleSubmit(e, "INSTRUCTOR")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor-email">Email</Label>
                  <Input
                    id="instructor-email"
                    name="email"
                    type="email"
                    placeholder="instructor@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor-password">Password</Label>
                  <Input id="instructor-password" name="password" type="password" required />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isSigningIn}>
                  {isSigningIn ? "Signing in..." : "Sign In as Instructor"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
