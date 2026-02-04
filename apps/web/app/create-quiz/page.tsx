"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Label } from "@/components/label"
import { axiosInstance } from "@/lib/axiosInstance"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"

interface Classroom {
  id: string
  name: string
}

interface QuestionForm {
  question: string
  options: string[]
  correctOption: string
}

export default function CreateQuizPage() {
  const router = useRouter()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: "", options: ["", "", "", ""], correctOption: "" },
  ])

  const [loading, setLoading] = useState(false)

  // 1️⃣ Fetch instructor classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await axiosInstance.get(
          "/instructor/classroom/my-classrooms"
        )
        setClassrooms(res.data.classrooms || [])
      } catch (err) {
        toast.error("Failed to fetch classrooms")
      }
    }

    fetchClassrooms()
  }, [])

  // 2️⃣ Handlers
  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions]
    ;(updated[index] as any)[field] = value
    setQuestions(updated)
  }

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctOption: "" },
    ])
  }

  // 3️⃣ Submit
  const handleCreateQuiz = async () => {
    if (!selectedClassroomId) {
      toast.error("Please select a classroom")
      return
    }

    setLoading(true)

    try {
      await axiosInstance.post(
        `/instructor/classroom/create-quiz/${selectedClassroomId}`,
        {
          title,
          description,
          questionAnswer: questions,
        }
      )

      toast.success("Quiz created successfully")
      router.push(`/class/${selectedClassroomId}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Quiz</h1>

      {/* Classroom selector */}
      <div className="space-y-2">
        <Label>Classroom</Label>
        <Select onValueChange={setSelectedClassroomId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a classroom" />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quiz info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Quiz description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.map((q, qi) => (
        <Card key={qi}>
          <CardHeader>
            <CardTitle>Question {qi + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Question"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(qi, "question", e.target.value)
              }
            />

            {q.options.map((opt, oi) => (
              <Input
                key={oi}
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={(e) =>
                  handleOptionChange(qi, oi, e.target.value)
                }
              />
            ))}

            <Input
              placeholder="Correct option (must match exactly)"
              value={q.correctOption}
              onChange={(e) =>
                handleQuestionChange(qi, "correctOption", e.target.value)
              }
            />
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addQuestion}>
        Add Question
      </Button>

      <Button onClick={handleCreateQuiz} disabled={loading}>
        {loading ? "Creating..." : "Create Quiz"}
      </Button>
    </div>
  )
}
