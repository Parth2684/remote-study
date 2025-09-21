import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ClientAuthLoader from "@/components/client-auth-loader"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "EduLite - Simple Virtual Classroom",
  description: "Easy-to-use virtual classroom platform designed for everyone",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
