"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axiosInstance"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { useAuthStore } from "@/stores/authStore/useAuthStore"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  questionId: string
  question: string
  options: Option[]
  selectedOption: {
    id: string
    text: string
  } | null
  isCorrect: boolean
}

interface Result {
  score: number
  total: number
  questions: Question[]
  student?: {
    name: string
    email: string
  }
}

export default function QuizResultPage() {
  const { authUser } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const initialRoute =
          authUser?.role === "INSTRUCTOR" ? "instructor" : "student"

        const res = await axiosInstance.get(
          `/${initialRoute}/classroom/quiz/attempt/${attemptId}`
        )

        // 🔥 Normalize response
        if (authUser?.role === "INSTRUCTOR") {
          const attempt = res.data.attempt

          setResult({
            score: attempt.score,
            total: attempt.total,
            questions: attempt.answers, // rename
            student: attempt.student,   // extra info
          })
        } else {
          setResult(res.data.result)
        }
      } catch (err) {
        console.error(err)
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (attemptId && authUser) fetchResult()
  }, [attemptId, authUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load result
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Quiz Result</h1>

        {/* 👨‍🏫 Instructor: show student info */}
        {authUser?.role === "INSTRUCTOR" && result.student && (
          <p className="text-sm text-muted-foreground">
            {result.student.name} ({result.student.email})
          </p>
        )}

        <p className="text-lg">
          Score:{" "}
          <span className="font-bold text-green-600">
            {result.score}
          </span>{" "}
          / {result.total}
        </p>
      </div>

      {/* Questions */}
      {result.questions.map((q, index) => (
        <Card key={q.questionId}>
          <CardHeader>
            <CardTitle>
              {index + 1}. {q.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {q.options.map((opt) => {
              const isSelected = q.selectedOption?.id === opt.id
              const isCorrect = opt.isCorrect

              return (
                <div
                  key={opt.id}
                  className={`p-2 rounded border ${
                    isCorrect
                      ? "border-green-500 bg-green-100"
                      : isSelected
                      ? "border-red-500 bg-red-100"
                      : "border-muted"
                  }`}
                >
                  {opt.text}

                  {isCorrect && (
                    <span className="ml-2 text-green-600 text-sm">
                      (Correct)
                    </span>
                  )}

                  {isSelected && !isCorrect && (
                    <span className="ml-2 text-red-600 text-sm">
                      (Your answer)
                    </span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      
    </div>
  )
}