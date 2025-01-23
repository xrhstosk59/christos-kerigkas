// src/components/hero.tsx
'use client'

import { useTheme } from './themeprovider'

export function Hero() {
  const { theme } = useTheme()
  
  return (
    <div className={`relative isolate px-6 pt-14 lg:px-8 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className={`text-4xl font-bold tracking-tight sm:text-6xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Full Stack Developer
          </h1>
          <p className={`mt-6 text-lg leading-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Passionate about creating modern web applications with Next.js, React, and TypeScript.
            Currently focusing on real estate platforms and cryptocurrency trading solutions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#contact"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200"
            >
              Contact Me
            </a>
            <a 
              href="#projects" 
              className={`text-sm font-semibold leading-6 ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-700'
              } transition-colors duration-200`}
            >
              View Projects <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}