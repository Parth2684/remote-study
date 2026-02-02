"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Loader2 } from "lucide-react"
import { axiosInstance } from "@/lib/axiosInstance"
import toast from "react-hot-toast"
import { useAuthStore } from "@/stores/authStore/useAuthStore"

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  options: Option[]
}

export default function QuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const router = useRouter()

  const { authUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [classroomId, setClassroomId] = useState<string>("")
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  // 1️⃣ Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axiosInstance.get(`/student/classroom/quiz/${quizId}`)

        setQuizTitle(res.data.quiz.title)
        setQuestions(res.data.quiz.questions)
        setClassroomId(res.data.classroomId)
      } catch (err) {
        toast.error("Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }

    if (quizId) fetchQuiz()
  }, [quizId])

  // 2️⃣ Select answer
  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  // 3️⃣ Submit quiz
  const handleSubmit = async () => {
    if (!classroomId) return

    setSubmitting(true)

    try {
      const payload = {
        quizId,
        questionAnswers: questions.map((q) => ({
          questionId: q.id,
          optionId: answers[q.id],
        })),
      }

      const res = await axiosInstance.post(
        `/student/classroom/submit-quiz/${classroomId}`,
        payload
      )

      setResult({
        correct: res.data.correctAnswerCount,
        total: res.data.totalQuestionCount,
      })

      toast.success("Quiz submitted!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please sign in to attempt this quiz
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // 4️⃣ Result view
  if (result) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Quiz Result</h1>
        <p className="text-lg">
          You scored <strong>{result.correct}</strong> out of{" "}
          <strong>{result.total}</strong>
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{quizTitle}</h1>

      {questions.map((q, qi) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle>
              {qi + 1}. {q.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer border
                  ${
                    answers[q.id] === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }
                `}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => selectOption(q.id, opt.id)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </Button>
    </div>
  )
}
