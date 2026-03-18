'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ExternalLink, LoaderCircle } from 'lucide-react'

interface PdfPreviewProps {
  fileUrl: string
  title: string
  className?: string
}

export function PdfPreview({ fileUrl, title, className }: PdfPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!fileUrl) {
      setStatus('error')
      setBlobUrl(null)
      return
    }

    let isCancelled = false
    let objectUrl: string | null = null

    const loadPreview = async () => {
      try {
        setStatus('loading')
        setBlobUrl(null)

        const response = await fetch(fileUrl, { cache: 'force-cache' })
        if (!response.ok) {
          throw new Error(`Failed to load preview: ${response.status}`)
        }

        const blob = await response.blob()
        if (isCancelled) {
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
        setStatus('ready')
      } catch (error) {
        console.error('PDF preview load failed:', error)
        if (!isCancelled) {
          setStatus('error')
        }
      }
    }

    void loadPreview()

    return () => {
      isCancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [fileUrl])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-xl border border-border bg-background ${className ?? ''}`}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading certificate preview...</p>
        </div>
      </div>
    )
  }

  if (status === 'error' || !blobUrl) {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-xl border border-border bg-background ${className ?? ''}`}>
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-foreground">Preview is unavailable inside the modal.</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
            Open certificate in a new tab
          </a>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={blobUrl}
      title={title}
      className={className}
    />
  )
}
