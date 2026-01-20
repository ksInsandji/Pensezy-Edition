"use client";

// Placeholder for use-toast
import { useState, useEffect } from 'react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple implementation for now to fix build
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  function toast({ title, description, variant }: ToastProps) {
    console.log('Toast:', title, description, variant)
    setToasts((prev) => [...prev, { title, description, variant }])
  }

  return { toast, toasts }
}
