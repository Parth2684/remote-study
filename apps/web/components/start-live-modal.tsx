"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/button"

interface StartLiveModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: (title: string) => Promise<void>
  loading: boolean,
  title: string,
  setTitle: (title: string) => void
}

export const StartLiveModal = ({
  isOpen,
  onClose,
  onStart,
  loading, 
  title,
  setTitle
}: StartLiveModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Reset title when closing
  useEffect(() => {
    if (!isOpen) {
      setTitle("")
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Start Live Session
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-6">
          <label className="text-sm text-muted-foreground mb-2">
            Session Title
          </label>
          <input
            type="text"
            placeholder="Enter session name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={() => onStart(title)}
            disabled={!title.trim() || loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Start
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}