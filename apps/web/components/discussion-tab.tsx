"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Input } from "@/components/input"
import { MessageCircle, Loader2, Send, Paperclip, FileText, X, Download, Edit2, Trash2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { axiosInstance } from "@/lib/axiosInstance"

interface Message {
  id: string
  userId: string
  userName: string
  userProfilePic?: string
  content: string
  timestamp: Date
  isEdited: boolean
  role: 'INSTRUCTOR' | 'STUDENT'
  documentUrl?: string
  documentName?: string
  documentType?: string
  documentSize?: number
}

interface Document {
  id: string
  userId: string
  userName: string
  userProfilePic?: string
  content: string
  createdAt: string
  role: 'INSTRUCTOR' | 'STUDENT'
  documentUrl: string
  documentName: string
  documentType: string
  documentSize: number
}

interface DiscussionTabProps {
  classId: string
}

export function DiscussionTab({ classId }: DiscussionTabProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)
  
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)
  const connectedClassId = useRef<string | null>(null)
  const { authUser } = useAuthStore()

  useEffect(() => {
    const fetchMessages = async () => {
      if (!classId || !authUser) return

      try {
        setLoadingMessages(true)
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
            role: msg.role,
            documentUrl: msg.documentUrl,
            documentName: msg.documentName,
            documentType: msg.documentType,
            documentSize: msg.documentSize
          })))
        }
      } catch (err) {
        console.error('Error loading messages:', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [classId, authUser])

  useEffect(() => {
    if (!classId || !authUser) return

    // Don't create multiple connections for the same classroom
    if (initialized.current && connectedClassId.current === classId) {
      return
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (!token) {
      console.error('No authentication token found')
      return
    }

    initialized.current = true
    connectedClassId.current = classId
    
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    let reconnectTimeout: NodeJS.Timeout | null = null
    
    const connectWebSocket = () => {
      const wsUrl = `${WS_URL}/classroom/${classId}?token=${encodeURIComponent(token)}`
      console.log('Connecting to WebSocket:', wsUrl.replace(/token=[^&]+/, 'token=***'))
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully')
        setWsConnected(true)
        reconnectAttempts = 0 // Reset attempts on successful connection
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'auth_success':
              console.log('Authenticated as:', data.userName, data.role)
              break
              
            case 'new_message':
              setMessages((prev) => {
                const existingIndex = prev.findIndex(msg => 
                  msg.id === data.id || 
                  (msg.userId === data.userId && msg.content === data.content && msg.id.startsWith('temp-'))
                )
                
                if (existingIndex !== -1) {
                  const updated = [...prev]
                  updated[existingIndex] = {
                    id: data.id,
                    userId: data.userId,
                    userName: data.userName,
                    userProfilePic: data.userProfilePic,
                    content: data.content,
                    timestamp: new Date(data.createdAt),
                    isEdited: data.isEdited,
                    role: data.role,
                    documentUrl: data.documentUrl,
                    documentName: data.documentName,
                    documentType: data.documentType,
                    documentSize: data.documentSize
                  }
                  return updated
                } else {
                  return [...prev, {
                    id: data.id,
                    userId: data.userId,
                    userName: data.userName,
                    userProfilePic: data.userProfilePic,
                    content: data.content,
                    timestamp: new Date(data.createdAt),
                    isEdited: data.isEdited,
                    role: data.role,
                    documentUrl: data.documentUrl,
                    documentName: data.documentName,
                    documentType: data.documentType,
                    documentSize: data.documentSize
                  }]
                }
              })
              break
              
            case 'message_history':
              if (data.messages && data.messages.length > 0) {
                setMessages(data.messages.map((msg: any) => ({
                  id: msg.id,
                  userId: msg.userId,
                  userName: msg.userName,
                  userProfilePic: msg.userProfilePic,
                  content: msg.content,
                  timestamp: new Date(msg.createdAt),
                  isEdited: msg.isEdited,
                  role: msg.role,
                  documentUrl: msg.documentUrl,
                  documentName: msg.documentName,
                  documentType: msg.documentType,
                  documentSize: msg.documentSize
                })))
              }
              break
              
            case 'delete_message':
              setMessages((prev) => prev.filter(msg => msg.id !== data.messageId))
              break
              
            case 'edit_message':
              setMessages((prev) => prev.map(msg => 
                msg.id === data.id 
                  ? { ...msg, content: data.content, isEdited: true }
                  : msg
              ))
              break
              
            case 'error':
              console.error('WebSocket error:', data.message)
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
        console.log('WebSocket disconnected')
        setWsConnected(false)
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000) // Max 30 second wait
          console.log(`Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
          
          if (reconnectTimeout) clearTimeout(reconnectTimeout)
          reconnectTimeout = setTimeout(() => {
            connectWebSocket()
          }, backoffDelay)
        } else {
          console.warn('Max reconnection attempts reached')
        }
      }

      wsRef.current = ws
    }
    
    connectWebSocket()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [classId, authUser?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !authUser) return
    
    setIsSending(true)
    const contentToSend = newMessage.trim()
    
    try {
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        userId: authUser.id,
        userName: authUser.name || 'Unknown',
        content: contentToSend,
        timestamp: new Date(),
        isEdited: false,
        role: authUser.role as 'INSTRUCTOR' | 'STUDENT',
        documentUrl: undefined,
        documentName: undefined,
        documentType: undefined,
        documentSize: undefined
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage("")
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'send_message',
          content: contentToSend
        }
        
        wsRef.current.send(JSON.stringify(messageData))
      } else {
        const response = await axiosInstance.post(`/classroom/${classId}/messages`, {
          content: contentToSend
        })
        
        if (response.data.message) {
          setMessages(prev => prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? {
                  id: response.data.message.id,
                  userId: response.data.message.userId,
                  userName: response.data.message.userName,
                  userProfilePic: response.data.message.userProfilePic,
                  content: response.data.message.content,
                  timestamp: new Date(response.data.message.createdAt),
                  isEdited: response.data.message.isEdited,
                  role: response.data.message.role,
                  documentUrl: response.data.message.documentUrl,
                  documentName: response.data.message.documentName,
                  documentType: response.data.message.documentType,
                  documentSize: response.data.message.documentSize
                }
              : msg
          ))
        }
      }
      
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDocumentUpload = async () => {
    if (!selectedFile || !authUser) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('content', newMessage.trim() || `Shared a document: ${selectedFile.name}`)

      const response = await axiosInstance.post(
        `/classroom/${classId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.message) {
        setMessages(prev => [...prev, {
          id: response.data.message.id,
          userId: response.data.message.userId,
          userName: response.data.message.userName,
          userProfilePic: response.data.message.userProfilePic,
          content: response.data.message.content,
          timestamp: new Date(response.data.message.createdAt),
          isEdited: response.data.message.isEdited,
          role: response.data.message.role,
          documentUrl: response.data.message.documentUrl,
          documentName: response.data.message.documentName,
          documentType: response.data.message.documentType,
          documentSize: response.data.message.documentSize
        }])
      }

      setSelectedFile(null)
      setNewMessage("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error('Error uploading document:', err)
      alert('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const loadDocuments = async () => {
    if (!classId) return

    setLoadingDocuments(true)
    try {
      const response = await axiosInstance.get(`/classroom/${classId}/documents`)
      if (response.data.documents) {
        setDocuments(response.data.documents)
      }
    } catch (err) {
      console.error('Error loading documents:', err)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleViewDocuments = () => {
    setShowDocuments(true)
    loadDocuments()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-4 w-4" />
    if (mimeType.startsWith('image/')) return <FileText className="h-4 w-4" />
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
    if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    return <FileText className="h-4 w-4" />
  }

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditingContent(currentContent)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'edit_message',
          messageId: messageId,
          content: editingContent.trim()
        }
        wsRef.current.send(JSON.stringify(messageData))
      } else {
        await axiosInstance.patch(`/classroom/${classId}/messages/${messageId}`, {
          content: editingContent.trim()
        })
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: editingContent.trim(), isEdited: true }
          : msg
      ))

      setEditingMessageId(null)
      setEditingContent("")
    } catch (err) {
      console.error('Error editing message:', err)
      alert('Failed to edit message. Please try again.')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'delete_message',
          messageId: messageId
        }
        wsRef.current.send(JSON.stringify(messageData))
      } else {
        await axiosInstance.delete(`/classroom/${classId}/messages/${messageId}`)
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
      alert('Failed to delete message. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col h-150">
        <CardHeader className="pb-4 border-b bg-muted/30 dark:bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Class Discussions
              </CardTitle>
              <CardDescription className="text-xs">
                Engage with classmates and instructors
              </CardDescription>
            </div>
            {/* WebSocket connection indicator */}
            <div className="flex items-center gap-1 ml-4">
              <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs">{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto px-0 py-2">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground px-6">
              <div>
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start a conversation to get things moving!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const userInitials = message.userName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                
                return (
                  <div 
                    key={message.id} 
                    className="group flex gap-3 py-2 px-4 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                      message.role === 'INSTRUCTOR' 
                        ? 'bg-linear-to-br from-purple-500 to-purple-600' 
                        : 'bg-linear-to-br from-blue-500 to-blue-600'
                    }`}>
                      {userInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header with name, role badge, and timestamp */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-sm text-foreground">{message.userName}</h3>
                        {message.role === 'INSTRUCTOR' && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">Instructor</Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto group-hover:inline hidden">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      {/* Message content - editing mode */}
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSaveEdit(message.id)
                              }
                              if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(message.id)}
                              disabled={!editingContent.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground break-word leading-relaxed">
                            {message.content}
                          </p>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                          )}
                        </>
                      )}
                      
                      {/* Document Attachment */}
                      {message.documentUrl && (
                        <div className="mt-2 p-2.5 bg-muted/40 dark:bg-muted/30 border border-muted rounded-md flex items-center gap-2.5">
                          <div className="shrink-0">
                            {getFileIcon(message.documentType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{message.documentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {message.documentSize && formatFileSize(message.documentSize)}
                            </p>
                          </div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${message.documentUrl}`}
                            download={message.documentName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button size="sm" variant="outline" className="gap-1 h-8">
                              <Download className="h-3 w-3" />
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - shown on hover */}
                    <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {authUser && message.userId === authUser.id && !message.documentUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEditMessage(message.id, message.content)}
                            title="Edit message"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteMessage(message.id)}
                            title="Delete message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {authUser && ((message.userId === authUser.id && message.documentUrl) || (authUser.role === 'INSTRUCTOR' && message.userId !== authUser.id)) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteMessage(message.id)}
                          title="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Message Input Area */}
        <div className="border-t bg-muted/20 dark:bg-muted/10 p-4 space-y-3">
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="p-2.5 bg-muted/50 dark:bg-muted/30 border border-muted rounded-lg flex items-center gap-2.5">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 h-7 w-7 p-0"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleViewDocuments}
              className="gap-1 text-xs h-8"
            >
              <FileText className="h-3.5 w-3.5" />
              Documents
            </Button>
            {!wsConnected && (
              <span className="text-xs text-amber-600 dark:text-amber-400">Offline mode</span>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending || isUploading}
              className="flex-1 h-9 text-sm"
              maxLength={2000}
            />
            {selectedFile ? (
              <Button 
                type="button"
                onClick={handleDocumentUpload}
                disabled={isUploading}
                size="sm"
                className="h-9 px-3 gap-1"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Send</span>
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || isSending}
                size="sm"
                className="h-9 px-3 gap-1"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Send</span>
              </Button>
            )}
          </form>
          <p className="text-xs text-muted-foreground px-1">
            {newMessage.length}/2000
          </p>
        </div>
      </Card>

      {/* Documents Modal */}
      {showDocuments && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Class Documents
                  </CardTitle>
                  <CardDescription>All documents shared in this class</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDocuments(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {loadingDocuments ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-medium">No documents yet</p>
                  <p className="text-sm">Documents shared in this class will appear here</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border dark:border-muted rounded-lg p-4 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted dark:bg-muted/40 rounded-lg">
                          {getFileIcon(doc.documentType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-medium truncate">{doc.documentName}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(doc.documentSize)}
                              </p>
                            </div>
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}${doc.documentUrl}`}
                              download={doc.documentName}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="gap-1">
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>{doc.userName}</span>
                            {doc.role === 'INSTRUCTOR' && (
                              <Badge variant="secondary" className="text-xs">Instructor</Badge>
                            )}
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                          {doc.content && doc.content !== `Shared a document: ${doc.documentName}` && (
                            <p className="text-sm mt-2 text-foreground">{doc.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
