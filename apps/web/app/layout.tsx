import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/navbar"
import AuthInitializer from "@/components/auth-initializer"
import ClientAuthLoader from "@/components/client-auth-loader"

export const metadata: Metadata = {
  title: "EduLite - Simple Virtual Classroom",
  description: "Easy-to-use virtual classroom platform designed for everyone",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans`}>
        <Navbar />
        <main>
          <AuthInitializer />
          <ClientAuthLoader />
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
