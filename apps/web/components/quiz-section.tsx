"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/card"
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

  console.log("quizes: ", quizzes)

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No quizzes available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{quiz.title}</CardTitle>

              {authUser?.role === "INSTRUCTOR" && (
                <Badge>{quiz.attempts ?? 0} Attempts</Badge>
              )}

              {authUser?.role === "STUDENT" && quiz.attempted && (
                <Badge className="bg-green-600 text-white">
                  Attempted
                </Badge>
              )}
            </div>

            {quiz.description && (
              <CardDescription>{quiz.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex justify-end gap-2">

            {/* 🎓 STUDENT */}
            {authUser?.role === "STUDENT" && (
              <>
                {!quiz.attempted ? (
                  <Button
                    onClick={() =>
                      router.push(`/quiz/${quiz.id}`)
                    }
                  >
                    Start Quiz
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" disabled>
                      Attempted
                    </Button>

                    <Button
                      onClick={() =>
                        router.push(`/quiz/result/${quiz.attemptId}`)
                      }
                    >
                      View Result
                    </Button>
                  </>
                )}
              </>
            )}

            {/* 👨‍🏫 INSTRUCTOR */}
            {authUser?.role === "INSTRUCTOR" && (
              <Button
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