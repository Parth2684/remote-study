"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"

export default function JoinClassPage() {
  const [classCode, setClassCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoinClass = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    // Simulate joining class
    setTimeout(() => {
      setLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Join a Class</h1>
          <p className="text-muted-foreground">Enter the class code provided by your instructor</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Class Code
            </CardTitle>
            <CardDescription>Ask your instructor for the class code to join their virtual classroom</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classCode">Class Code</Label>
                <Input
                  id="classCode"
                  placeholder="Enter class code (e.g., ABC123)"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  required
                  className="text-center text-lg font-mono"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !classCode}>
                {loading ? "Joining..." : "Join Class"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Join a Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p>Get the class code from your instructor</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p>Enter the code in the field above</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p>Click "Join Class" to access the classroom</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
