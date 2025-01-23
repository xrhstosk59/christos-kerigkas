'use client'

import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'

const projects = [
  {
    name: 'Real Estate Platform',
    description: 'Full-stack web application for real estate listings',
    tech: ['Next.js', 'React', 'Supabase', 'Drizzle', 'Tailwind CSS', 'PostgreSQL'],
    status: 'In Development',
    link: 'https://github.com/yourusername/real-estate'
  },
  {
    name: 'Sniper4Crypto',
    description: 'Advanced crypto analysis tool using data mining and machine learning to detect trending meme tokens',
    tech: ['Python', 'Scikit-learn', 'Telegram Bot API', 'MongoDB/PostgreSQL'],
    status: 'Active',
    link: 'https://github.com/yourusername/sniper4crypto'
  },
  {
    name: 'Trading Bot',
    description: 'Automated trading system with market analysis, strategy implementation, and real-time notifications',
    tech: ['Python', 'Exchange APIs', 'Telegram Bot API'],
    status: 'Active',
    link: 'https://github.com/yourusername/trading-bot'
  }
]

export function Experience() {
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

  return (
    <section id="experience" className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Experience & Projects
          </motion.h2>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-16 space-y-8"
          >
            {projects.map((project) => (
              <motion.div
                key={project.name}
                variants={item}
                className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-all ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {project.name}
                  </h3>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <p className={`mt-2 text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {project.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-flex items-center text-sm font-medium ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  View Project
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}