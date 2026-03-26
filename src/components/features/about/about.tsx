'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Code2, GraduationCap, MapPin, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

const details = [
  {
    icon: Code2,
    title: 'Web Developer',
    description: 'Building mainly with TypeScript and JavaScript across React, Next.js, Supabase, and selected Java/JavaFX coursework projects'
  },
  {
    icon: GraduationCap,
    title: 'Undergraduate CS Student',
    description: 'Studying Computer Science at Democritus University of Thrace'
  },
  {
    icon: Briefcase,
    title: 'Internship',
    description: 'Technical Support internship focused on hardware, printers, networking, and day-to-day ICT support for the Municipality of Nea Propontida'
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Based in Greece and open to new opportunities and collaborations'
  }
]

export function About() {
  const { theme } = useTheme()
  
  // ✅ FIXED: Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  // ✅ Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ FIXED: Use neutral classes until mounted
  if (!mounted) {
    return (
      <section 
        id="about" 
        className="py-24 bg-white"
        aria-label="About Me Section"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center text-gray-900">
              About Me
            </h2>
            
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {details.map((detail) => (
                <div
                  key={detail.title}
                  className="relative p-6 rounded-2xl transition-colors bg-gray-50 hover:bg-gray-100"
                >
                  <div className="rounded-lg p-2 w-10 h-10 mb-4 flex items-center justify-center bg-white">
                    <detail.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {detail.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed text-gray-600">
                    {detail.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-12 text-lg leading-8 text-center text-gray-600">
              Computer Science student at Democritus University of Thrace, focused on responsive websites and web applications with
              TypeScript and JavaScript. My work so far comes mainly from university projects, personal projects, and experimentation,
              often using AI-assisted workflows for faster iteration, debugging, and cleanup.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ✅ FIXED: Now use theme-dependent classes only after mounted
  return (
    <section 
      id="about" 
      className={cn(
        "py-24",
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      )}
      aria-label="About Me Section"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h2 className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl text-center",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            About Me
          </h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {details.map((detail, index) => (
              <motion.div
                key={detail.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-6 rounded-2xl transition-colors",
                  theme === 'dark' 
                    ? 'bg-gray-900/50 hover:bg-gray-900/80' 
                    : 'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "rounded-lg p-2 w-10 h-10 mb-4 flex items-center justify-center",
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                )}>
                  <detail.icon className={cn(
                    "w-5 h-5",
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  )} />
                </div>
                
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {detail.title}
                </h3>
                
                <p className={cn(
                  "text-sm leading-relaxed",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {detail.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              "mt-12 text-lg leading-8 text-center",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            Computer Science student at Democritus University of Thrace, focused on responsive websites and web applications with
            TypeScript and JavaScript. My work so far comes mainly from university projects, personal projects, and experimentation,
            often using AI-assisted workflows for faster iteration, debugging, and cleanup.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
