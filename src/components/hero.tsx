'use client'

import { useTheme } from './themeprovider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Hero() {
  const { theme } = useTheme()
  
  const socialLinks = [
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
            className="mb-8 relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-2 ring-indigo-600"
          >
            <Image
              src="/profile.jpg"
              alt="Christos Kerigkas Profile Picture"
              fill
              priority
              className="object-cover"
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