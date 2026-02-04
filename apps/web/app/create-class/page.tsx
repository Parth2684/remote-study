"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useInstructorStore } from "@/stores/instructorStore/useInstructorStore"

export default function CreateClassPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { createClassroom } = useInstructorStore()

const handleCreateClass = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    await createClassroom(
      formData.name,
      formData.description
    )

    router.push("/dashboard")
  } catch (error) {
    console.error("Failed to create class", error)
  } finally {
    setLoading(false)
  }
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
          <p className="text-muted-foreground">
            Set up a new virtual classroom for your students.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Details
            </CardTitle>
            <CardDescription>
              Provide a name and description for your new class.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              {/* Class Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Grade 10 Mathematics"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                />
              </div>

              {/* Class Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., Algebra, Geometry, and Trigonometry basics"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.name}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Class"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}