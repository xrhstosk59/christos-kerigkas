// src/components/about.tsx
'use client'

import { useTheme } from './themeprovider'

export function About() {
  const { theme } = useTheme()
  
  return (
    <section id="about" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            About Me
          </h2>
          <div className={`mt-6 space-y-4 text-lg leading-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <p>
              I am a 21-year-old Computer Science student focusing on web development.
              Currently working on a real estate platform using Next.js, React, and TypeScript. I
              have a strong interest in cryptocurrency trading and blockchain technology, having
              developed trading bots and analysis tools.
            </p>
            <p>
              Based in Kavala, Greece, with roots in Chalkidiki, I maintain a balanced lifestyle
              including daily gym workouts and healthy nutrition alongside my technical pursuits.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}