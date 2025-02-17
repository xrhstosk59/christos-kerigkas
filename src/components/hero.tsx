// src/components/hero.tsx
'use client'

import { useState, useRef } from 'react'
import { useTheme } from './themeprovider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail, Upload, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
  username: string
}

export default function Hero() {
  const { theme } = useTheme()
  const [profileImage, setProfileImage] = useState('/profile.jpg')
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

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        if (profileImage !== '/profile.jpg') {
          await fetch('/api/upload', {
            method: 'DELETE',
            body: JSON.stringify({ filename: profileImage }),
            headers: { 'Content-Type': 'application/json' }
          })
        }
        setProfileImage(data.filename)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (profileImage === '/profile.jpg') return

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ filename: profileImage }),
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.success) {
        setProfileImage('/profile.jpg')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
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
              <Image
                src={profileImage}
                alt="Christos Kerigkas Profile Picture"
                width={128}
                height={128}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              {profileImage !== '/profile.jpg' && (
                <button
                  onClick={handleDeleteImage}
                  disabled={isUploading}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
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
            {socialLinks.map((socialLink) => {
              const Icon = socialLink.icon
              return (
                <a
                  key={socialLink.label}
                  href={socialLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-full transition-colors duration-200",
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  aria-label={socialLink.label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="sr-only">{socialLink.username}</span>
                </a>
              )
            })}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6"
          >
            <a
              href="#contact"
              className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
            >
              Get in Touch
            </a>
            <a 
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
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}