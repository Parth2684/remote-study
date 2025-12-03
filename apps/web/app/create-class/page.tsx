"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { axiosInstance } from "../../lib/axiosInstance"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function CreateClassPage() {
  // Updated state to only include the name
  const [formData, setFormData] = useState({
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axiosInstance.post("/instructor/classroom/create", formData)

      if (response.status === 200) {
        toast.success("Class created successfully!")
        router.push("/dashboard")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }

    setFormData({
      name: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create New Class</h1>
          <p className="text-muted-foreground">Set up a new virtual classroom for your students.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Details
            </CardTitle>
            <CardDescription>Provide a name for your new class.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Grade 10 Mathematics"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              {/* Removed Subject and Description fields */}
              <Button type="submit" className="w-full" disabled={loading || !formData.name}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Class"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <p>Your class will be created with a unique class code that students can use to join.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <p>You will be redirected to your dashboard where you can see your new class.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <p>Click on the class to start adding content, creating assignments, and managing students.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}