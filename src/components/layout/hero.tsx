// src/components/layout/hero.tsx - FIXED HYDRATION MISMATCH
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useProfile } from '@/components/providers/theme-provider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail, Upload, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { isSupabaseUrl, PROFILE_IMAGE_URL } from '@/lib/utils/storage'

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
  username: string
}

export default function Hero() {
  const { theme } = useTheme()
  const { profileImage, setProfileImage } = useProfile()
  
  // ✅ FIXED: Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const socialLinks: SocialLink[] = [
    {
      icon: Github,
      href: 'https://github.com/yourusername',
      label: 'GitHub Profile',
      username: '@yourusername'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/yourusername',
      label: 'LinkedIn Profile',
      username: 'Christos Kerigkas'
    },
    {
      icon: Mail,
      href: 'mailto:your-email@example.com',
      label: 'Email Contact',
      username: 'your-email@example.com'
    }
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Μη έγκυρος τύπος αρχείου. Παρακαλώ επιλέξτε εικόνα JPG, PNG ή WebP.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Το αρχείο είναι πολύ μεγάλο. Το μέγιστο μέγεθος είναι 5MB.')
      return
    }

    try {
      setIsUploading(true)
      setImageError(false)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        if (profileImage !== PROFILE_IMAGE_URL && isSupabaseUrl(profileImage)) {
          try {
            const deleteResponse = await fetch('/api/upload', {
              method: 'DELETE',
              body: JSON.stringify({ filename: profileImage }),
              headers: { 'Content-Type': 'application/json' }
            })

            if (!deleteResponse.ok) {
              console.warn('Failed to delete old profile image:', profileImage)
            }
          } catch (deleteError) {
            console.error('Error during old image deletion:', deleteError)
          }
        }

        setProfileImage(data.filename)
      } else {
        throw new Error(data.error || 'Unknown error during upload')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Παρουσιάστηκε σφάλμα κατά την αποστολή της εικόνας. Παρακαλώ δοκιμάστε ξανά.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (profileImage === PROFILE_IMAGE_URL) return

    try {
      setIsUploading(true)

      const response = await fetch('/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ filename: profileImage }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setProfileImage(PROFILE_IMAGE_URL)
      } else {
        throw new Error(data.error || 'Unknown error during deletion')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Παρουσιάστηκε σφάλμα κατά τη διαγραφή της εικόνας. Παρακαλώ δοκιμάστε ξανά.')
    } finally {
      setIsUploading(false)
    }
  }

  const imageLoader = useCallback(({ src, width }: { src: string; width: number }) => {
    if (isSupabaseUrl(src)) {
      return src
    }
    if (src.startsWith('/')) {
      return `${src}?w=${width}`
    }
    return src
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    console.warn('Profile image failed to load, falling back to default')

    if (profileImage !== PROFILE_IMAGE_URL) {
      setProfileImage(PROFILE_IMAGE_URL)
    }
  }, [profileImage, setProfileImage])

  // ✅ FIXED: Use neutral classes until mounted
  if (!mounted) {
    return (
      <section
        className="relative isolate px-4 sm:px-6 pt-14 lg:px-8 min-h-[calc(100vh-64px)] flex items-center bg-white"
        aria-label="Introduction"
      >
        <div className="mx-auto max-w-2xl py-12 sm:py-20 lg:py-32">
          <div className="text-center">
            <div className="relative group mb-8 mx-auto">
              <div className="w-32 h-32 relative rounded-full overflow-hidden ring-2 ring-indigo-600 bg-gray-200">
                {/* Placeholder while loading */}
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Christos Kerigkas
              </h1>
              <p className="mt-4 text-lg lg:text-xl font-semibold text-gray-600">
                Full Stack Developer
              </p>
              <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto text-gray-600">
                Building modern web applications and crypto trading solutions.
                Specialized in Next.js, React, and TypeScript development.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ✅ FIXED: Now use theme-dependent classes only after mounted
  return (
    <section
      className={cn(
        "relative isolate px-4 sm:px-6 pt-14 lg:px-8 min-h-[calc(100vh-64px)] flex items-center",
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      )}
      aria-label="Introduction"
    >
      <div className="mx-auto max-w-2xl py-12 sm:py-20 lg:py-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative group mb-8 mx-auto"
          >
            <div className="w-32 h-32 relative rounded-full overflow-hidden ring-2 ring-indigo-600">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 dark:bg-gray-900/70 text-sm text-gray-700 dark:text-gray-300 z-10">
                      Image failed to load
                    </div>
                  )}
                  {isSupabaseUrl(profileImage) ? (
                    <Image
                      src={profileImage}
                      alt="Christos Kerigkas Profile Picture"
                      fill
                      sizes="(max-width: 768px) 96px, 128px"
                      priority
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                      unoptimized={true}
                    />
                  ) : (
                    <Image
                      loader={imageLoader}
                      src={profileImage}
                      alt="Christos Kerigkas Profile Picture"
                      fill
                      sizes="(max-width: 768px) 96px, 128px"
                      priority
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Upload profile picture"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              {profileImage !== PROFILE_IMAGE_URL && (
                <button
                  onClick={handleDeleteImage}
                  disabled={isUploading}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Remove profile picture"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Christos Kerigkas
            </h1>

            <p className={cn(
              "mt-4 text-lg lg:text-xl font-semibold",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Full Stack Developer
            </p>

            <p className={cn(
              "mt-6 text-base sm:text-lg max-w-2xl mx-auto",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}>
              Building modern web applications and crypto trading solutions.
              Specialized in Next.js, React, and TypeScript development.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center gap-4"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full transition-colors duration-200",
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
                aria-label={link.label}
              >
                <link.icon className="w-6 h-6" />
                <span className="sr-only">{link.username}</span>
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6"
          >
            <Link
              href="#contact"
              className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
            >
              Get in Touch
            </Link>
            <Link
              href="#projects"
              className={cn(
                "group w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold leading-6 transition-colors duration-200",
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-900 hover:text-gray-700'
              )}
            >
              View Projects
              <ArrowDownCircle className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}