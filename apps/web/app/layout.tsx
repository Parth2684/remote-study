import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/navbar"

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
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
