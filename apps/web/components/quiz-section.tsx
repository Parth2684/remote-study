"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/card"
import { Badge } from "@/components/badge"
import { useAuthStore } from "@/stores/authStore/useAuthStore"

interface Quiz {
  id: string
  title: string
  description?: string
  attempts?: number
  attempted?: boolean
  attemptId?: string | null
}

export const QuizSection = ({ quizzes }: { quizzes: Quiz[] }) => {
  const { authUser } = useAuthStore()
  const router = useRouter()

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center mt-10">
        No quizzes available.
      </div>
    )
  }

  return (
    <div className="grid gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card
          key={quiz.id}
          className="group rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <CardHeader className="space-y-2">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-semibold leading-snug">
                {quiz.title}
              </CardTitle>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap justify-end">
                {authUser?.role === "INSTRUCTOR" && (
                  <Badge variant="secondary">
                    {quiz.attempts ?? 0} Attempts
                  </Badge>
                )}

                {authUser?.role === "STUDENT" && quiz.attempted && (
                  <Badge className="bg-green-600 text-white">
                    Attempted
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {quiz.description && (
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex justify-end gap-2 pt-2">
            {/* 🎓 STUDENT */}
            {authUser?.role === "STUDENT" && (
              <>
                {!quiz.attempted ? (
                  <Button
                    className="rounded-xl"
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                  >
                    Start Quiz
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl"
                    variant="default"
                    onClick={() =>
                      router.push(`/quiz/result/${quiz.attemptId}`)
                    }
                  >
                    View Result
                  </Button>
                )}
              </>
            )}

            {/* 👨‍🏫 INSTRUCTOR */}
            {authUser?.role === "INSTRUCTOR" && (
              <Button
                className="rounded-xl"
                onClick={() =>
                  router.push(`/quiz/${quiz.id}/attempts`)
                }
              >
                View Attempts
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}