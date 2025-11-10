'use client'

import { useState, useEffect } from 'react'
import { Github, Linkedin, Mail } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use neutral class until mounted to prevent hydration mismatch
  return (
    <footer className={mounted && theme === 'dark' ? 'bg-gray-950' : 'bg-gray-900'}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="https://github.com/xrhstosk59" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <Github className="h-6 w-6" />
          </a>
          <a href="https://www.linkedin.com/in/christoskerigkas/" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <Linkedin className="h-6 w-6" />
          </a>
          <a href="mailto:xrhstosk59@gmail.com" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <Mail className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Christos Kerigkas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}