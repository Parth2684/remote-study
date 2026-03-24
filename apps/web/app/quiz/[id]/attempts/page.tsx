"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { Loader2 } from "lucide-react"

interface Attempt {
  id: string
  score: number
  createdAt: string
  student: {
    name: string
    email: string
  }
}

export default function QuizAttemptsPage() {
  const { id } = useParams()
  const router = useRouter()

  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await axiosInstance.get(
          `/instructor/classroom/quiz/${id}/attempts`
        )
        setAttempts(res.data.attempts)
      } catch (err) {
        console.error("Failed to fetch attempts", err)
      } finally {
        setLoading(false)
      }
    }

fetchAttempts()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    )
  }

  if (!attempts.length) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        No attempts yet.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Quiz Attempts</h1>

      {attempts.map((attempt) => (
        <Card key={attempt.id}>
          <CardHeader>
            <CardTitle>{attempt.student.name}</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p>Email: {attempt.student.email}</p>
              <p>Score: {attempt.score}</p>
              <p>
                Date:{" "}
                {new Date(attempt.createdAt).toLocaleString()}
              </p>
            </div>

            <Button
              onClick={() =>
                router.push(`/quiz/result/${attempt.id}`)
              }
            >
              View Result
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}