// src/components/optimized-image.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

const FALLBACK_SRC = '/images/projects/placeholder.svg'

type OptimizedImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        quality={90}
        loading="lazy"
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'}
        `}
        onLoad={() => setIsLoading(false)}
        // Χωρίς αυτό, μια εικόνα που αποτυγχάνει μένει μόνιμα στο blur state
        // επειδή το onLoad δεν καλείται ποτέ.
        onError={() => {
          if (currentSrc !== FALLBACK_SRC) {
            setCurrentSrc(FALLBACK_SRC)
            return
          }
          setIsLoading(false)
        }}
      />
    </div>
  )
}
