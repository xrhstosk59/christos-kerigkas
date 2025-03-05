// src/components/enhanced-image.tsx
"use client"

import Image from 'next/image'
import { useState } from 'react'

type EnhancedImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function EnhancedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Create unique cache key based on image dimensions and src
  const cacheKey = `${width}x${height}-${src.replace(/\W/g, '')}`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={90}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        // Next.js 15 new image cache options
        {...(process.env.NODE_ENV === 'production' ? {
          fetchPriority: priority ? 'high' : 'auto',
          // Add cache-specific params for CDN caching
          cacheId: cacheKey,
        } : {})}
      />
    </div>
  )
}