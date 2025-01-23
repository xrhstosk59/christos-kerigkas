'use client'

import { useTheme } from './themeprovider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Hero() {
  const { theme } = useTheme()
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const socialLinks = [
    { icon: Github, href: 'https://github.com/yourusername', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:your-email@example.com', label: 'Email' }
  ]

  return (
    <section className={cn(
      "relative isolate px-4 sm:px-6 pt-14 lg:px-8 min-h-[calc(100vh-64px)] flex items-center",
      theme === 'dark' ? 'bg-gray-950' : 'bg-white'
    )}>
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className={cn(
            "relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]",
            theme === 'dark' 
              ? 'from-indigo-600 via-purple-600 to-pink-700'
              : 'from-indigo-500 via-purple-500 to-pink-500'
          )}
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-2xl py-12 sm:py-20 lg:py-32"
      >
        <div className="text-center">
          <motion.div 
            variants={item}
            className="mb-8 relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-2 ring-indigo-600"
          >
            <Image
              src="/profile.jpg"
              alt="Christos Kerigkas"
              fill
              priority
              className="object-cover"
            />
          </motion.div>

          <motion.h1 
            variants={item}
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            Χρήστος Κερίγκας
          </motion.h1>

          <motion.p 
            variants={item}
            className={cn(
              "mt-4 text-lg lg:text-xl font-semibold",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Full Stack Developer
          </motion.p>

          <motion.p 
            variants={item}
            className={cn(
              "mt-6 text-base sm:text-lg max-w-2xl mx-auto",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            Passionate about creating modern web applications with Next.js, React, and TypeScript.
            Currently focusing on real estate platforms and cryptocurrency trading solutions.
          </motion.p>

          <motion.div 
            variants={item}
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
              </a>
            ))}
          </motion.div>

          <motion.div 
            variants={item}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6"
          >
            <a
              href="#contact"
              className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
            >
              Contact Me
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
      </motion.div>

      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className={cn(
            "relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]",
            theme === 'dark' 
              ? 'from-indigo-600 via-purple-600 to-pink-700'
              : 'from-indigo-500 via-purple-500 to-pink-500'
          )}
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}