// src/components/hero.tsx - Με τροποποιήσεις για το Supabase Storage
'use client'

import { useState, useRef } from 'react'
import { useTheme } from './theme-provider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail, Upload, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { isSupabaseUrl } from '@/lib/storage'

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
  username: string
}

export default function Hero() {
  const { theme, profileImage, setProfileImage } = useTheme()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    
    // Reset input to ensure change event fires on selecting the same file
    e.target.value = ''
    
    // Validate file type and size before sending
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
        // Delete old profile image if it's not the default
        if (profileImage !== '/profile.jpg' && isSupabaseUrl(profileImage)) {
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
        
        // Update profile image with the new one
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
    if (profileImage === '/profile.jpg') return
    
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
        setProfileImage('/profile.jpg')
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

  // Προσθήκη loader για χειρισμό εξωτερικών URLs του Supabase
  const imageLoader = ({ src }: { src: string }) => {
    // Αν είναι Supabase URL, επέστρεψέ το ως έχει
    if (isSupabaseUrl(src)) {
      return src
    }
    // Αλλιώς χρησιμοποίησε το κανονικό path
    return src
  }

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
                <Image
                  loader={imageLoader}
                  src={profileImage}
                  alt="Christos Kerigkas Profile Picture"
                  width={128}
                  height={128}
                  priority
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Fallback to default image if the custom one fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/profile.jpg') {
                      console.warn('Profile image failed to load, falling back to default');
                      setProfileImage('/profile.jpg');
                    }
                  }}
                  unoptimized={isSupabaseUrl(profileImage)} // Απενεργοποίηση του Next.js optimization για Supabase URLs
                />
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
              {profileImage !== '/profile.jpg' && (
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

          {/* Το υπόλοιπο του component παραμένει ίδιο */}
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