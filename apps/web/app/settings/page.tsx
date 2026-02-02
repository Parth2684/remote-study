"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Badge } from "@/components/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Mail, Shield, Bell, Palette, Globe } from "lucide-react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { signoutAction } from "@/actions/signout"
import ClientAuthLoader from "@/components/client-auth-loader"

export default function SettingsPage() {
  const router = useRouter()
  const { authUser, isCheckingAuth, updateUser } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "" })

  // Populate form when authUser loads
  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name,
        email: authUser.email,
      })
    }
  }, [authUser])

  // Redirect ONLY after auth check finishes
  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      router.replace("/signin")
    }
  }, [isCheckingAuth, authUser])

  const handleSave = async () => {
    setIsEditing(false)
    // await updateUser({
    //     name: formData.name,
    //     email: formData.email,
    // })

    // iska backend route nahi bana hai so comment karke rakha hu
  }

  const handleSignOut = async () => {
    await signoutAction()
    router.replace("/")
  }

  if (isCheckingAuth || !authUser) {
    return <ClientAuthLoader />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
            <BookOpen className="h-7 w-7 text-primary ml-3" />
            <h1 className="ml-3 font-bold text-xl">Settings</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">{authUser.role}</Badge>
            <span className="text-sm">{authUser.name}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-6 grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              ) : (
                <p className="text-sm p-2 bg-gray-50 rounded">{authUser.name}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
              ) : (
                <p className="text-sm p-2 bg-gray-50 rounded">{authUser.email}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
