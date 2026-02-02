"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"
import { axiosInstance } from "@/lib/axiosInstance"
import toast from "react-hot-toast"

export default function JoinClassPage() {
  const [classCode, setClassCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axiosInstance.post(
        `/student/classroom/join/${classCode}`
      )

      toast.success(res.data.message || "Joined classroom successfully")

      // Redirect to classroom page
      router.push(`/class/${classCode}`)
    } catch (error: any) {
      console.error(error)
      toast.error(
        error?.response?.data?.message || "Failed to join classroom"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Join a Class</h1>
          <p className="text-muted-foreground">
            Enter the class code provided by your instructor
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Class Code
            </CardTitle>
            <CardDescription>
              Ask your instructor for the class code
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleJoinClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classCode">Class Code</Label>
                <Input
                  id="classCode"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  required
                  className="text-center text-lg font-mono"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !classCode}
              >
                {loading ? "Joining..." : "Join Class"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
