/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Badge } from "@/components/badge"
import { Input } from "@/components/input"
import { useParams } from "next/navigation"
import { ArrowLeft, Users, MessageCircle, BookOpen, Loader2, Copy, Check, Send } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axiosInstance"
import { Sessions } from "@/components/sessions"

// Define the interface for quiz data
interface Quiz {
  id: string;
  title: string;
  description: string;
  attempts?: number;
}

// Define the interface for class data
interface ClassData {
  name: string;
  instructor: string;
  description: string;
  students: number;
  code: string;
  quizzes: Quiz[];
}

// Define the interface for discussion messages
interface Message {
  id: string;
  userId: string;
  userName: string;
  userProfilePic?: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
  role: 'INSTRUCTOR' | 'STUDENT';
}

export default function ClassPage() {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Discussion state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  
  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const classId = Array.isArray(params.id) ? params.id[0] : params.id
  const { authUser } = useAuthStore()
  const router = useRouter()

  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId || !authUser) return

      try {
        setLoading(true)
        setError(null)

        const endpoint =
          authUser.role === "INSTRUCTOR"
            ? `/instructor/classroom/${classId}`
            : `/student/classroom/${classId}`

        const res = await axiosInstance.get(endpoint)
        const classroom = res.data.classroom

        setClassData({
          name: classroom.name,
          description: classroom.description,
          instructor: classroom.instructor.name,
          students: classroom.students.length,
          code: classroom.id,
          quizzes: classroom.quizzes.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            attempts: quiz.attempts ?? 0,
          })),
        })

        // Load existing messages via REST API
        try {
          const messagesRes = await axiosInstance.get(`/classroom/${classId}/messages`)
          if (messagesRes.data.messages) {
            setMessages(messagesRes.data.messages.map((msg: any) => ({
              id: msg.id,
              userId: msg.userId,
              userName: msg.userName,
              userProfilePic: msg.userProfilePic,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              isEdited: msg.isEdited,
              role: msg.role
            })))
          }
        } catch (err) {
          console.error('Error loading messages:', err)
        }

      } catch (err) {
        console.error("Error fetching class data:", err)
        setError("Failed to load class data")
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [classId, authUser])

  // WebSocket connection setup
  useEffect(() => {
    if (!classId || !authUser) return

    // REPLACE WITH YOUR BACKEND URL
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    
    // Create WebSocket connection
    // Cookie with authToken will be sent automatically by browser
    const ws = new WebSocket(`${WS_URL}/classroom/${classId}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected to classroom:', classId)
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle different message types from server
        switch (data.type) {
          case 'auth_success':
            console.log('Authenticated as:', data.userName, data.role)
            break
            
          case 'new_message':
            // Add new message to the list
            setMessages((prev) => [...prev, {
              id: data.id,
              userId: data.userId,
              userName: data.userName,
              userProfilePic: data.userProfilePic,
              content: data.content,
              timestamp: new Date(data.createdAt),
              isEdited: data.isEdited,
              role: data.role
            }])
            break
            
          case 'message_history':
            // Load historical messages (already loaded via REST API, but can update if needed)
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages.map((msg: any) => ({
                id: msg.id,
                userId: msg.userId,
                userName: msg.userName,
                userProfilePic: msg.userProfilePic,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
                isEdited: msg.isEdited,
                role: msg.role
              })))
            }
            break
            
          case 'delete_message':
            // Remove deleted message
            setMessages((prev) => prev.filter(msg => msg.id !== data.messageId))
            break
            
          case 'edit_message':
            // Update edited message
            setMessages((prev) => prev.map(msg => 
              msg.id === data.id 
                ? { ...msg, content: data.content, isEdited: true }
                : msg
            ))
            break
            
          case 'error':
            console.error('WebSocket error:', data.message)
            // Show error to user (you can add toast notification here)
            break
            
          default:
            console.log('Unknown message type:', data.type)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setWsConnected(false)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected from classroom:', classId)
      setWsConnected(false)
      
      // Optional: Implement reconnection logic
      // setTimeout(() => {
      //   console.log('Attempting to reconnect...')
      //   // Reconnect logic here
      // }, 3000)
    }

    wsRef.current = ws

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [classId, authUser])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !authUser) return
    
    setIsSending(true)
    
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send via WebSocket
        const messageData = {
          type: 'send_message',
          content: newMessage.trim()
        }
        
        wsRef.current.send(JSON.stringify(messageData))
      } else {
        // Fallback to REST API if WebSocket is not connected
        const response = await axiosInstance.post(`/classroom/${classId}/messages`, {
          content: newMessage.trim()
        })
        
        // Add message to local state
        if (response.data.message) {
          setMessages(prev => [...prev, {
            id: response.data.message.id,
            userId: response.data.message.userId,
            userName: response.data.message.userName,
            userProfilePic: response.data.message.userProfilePic,
            content: response.data.message.content,
            timestamp: new Date(response.data.message.createdAt),
            isEdited: response.data.message.isEdited,
            role: response.data.message.role
          }])
        }
      }
      
      // Clear input
      setNewMessage("")
      
    } catch (err) {
      console.error('Error sending message:', err)
      // Show error to user (you can add toast notification here)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleCopyCode = async () => {
  try {
      await navigator.clipboard.writeText(classData!.code)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 4000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }


  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Please log in to view this page</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">{error || 'Class not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{classData.name}</h1>
              <p className="text-muted-foreground mb-4">{classData.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{classData.students} {classData.students === 1 ? 'student' : 'students'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />

                  <span>Code: {classData.code}</span>
                </div>
                {/* WebSocket connection indicator */}
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs">{wsConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {classData.students > 0 ? 'Active' : 'No Students'}
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({classData.quizzes.length})</TabsTrigger>
            <TabsTrigger value="Sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Class Discussions
                  </CardTitle>
                  <CardDescription>Join the conversation with your classmates</CardDescription>
                </CardHeader>
                
                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                      <div>
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm">Be the first to start a discussion!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`border rounded-lg p-4 transition-colors ${
                            message.userId === authUser.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* User Avatar */}
                            <div className={`p-2 rounded-full shrink-0 ${
                              message.role === 'INSTRUCTOR' ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              <MessageCircle className={`h-4 w-4 ${
                                message.role === 'INSTRUCTOR' ? 'text-purple-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium truncate">{message.userName}</h3>
                                  {message.role === 'INSTRUCTOR' && (
                                    <Badge variant="secondary" className="text-xs">Instructor</Badge>
                                  )}
                                  {message.isEdited && (
                                    <span className="text-xs text-muted-foreground">(edited)</span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground break-word">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </CardContent>

                {/* Message Input Area */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1"
                      maxLength={2000}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      size="icon"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    {newMessage.length}/2000 characters
                    {!wsConnected && <span className="text-amber-600 ml-2">• Offline mode - messages will sync when reconnected</span>}
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="space-y-6">
              {authUser?.role === 'INSTRUCTOR' && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => router.push(`/quiz/create?classId=${classId}`)}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Create Quiz
                  </Button>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Quizzes & Assignments
                      </CardTitle>
                      <CardDescription>Test your knowledge with quizzes and assignments</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {classData.quizzes.length} {classData.quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.quizzes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="font-medium">No quizzes available yet</p>
                      <p className="text-sm">
                        {authUser?.role === 'INSTRUCTOR' 
                          ? 'Create your first quiz to get started' 
                          : 'Check back later for available quizzes'}
                      </p>
                      {authUser?.role === 'INSTRUCTOR' && (
                        <Button 
                          onClick={() => router.push(`/quiz/create?classId=${classId}`)}
                          className="mt-4"
                        >
                          Create Quiz
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {classData.quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            {quiz.description && (
                              <CardDescription className="line-clamp-2">
                                {quiz.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                {quiz.attempts !== undefined && (
                                  <span>{quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}</span>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => router.push(`/quiz/${quiz.id}`)}
                              >
                                {authUser?.role === 'INSTRUCTOR' ? 'View' : 'Start'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="Sessions">
            <Sessions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}