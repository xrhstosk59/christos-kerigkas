// src/components/projects.tsx
'use client'

import { useTheme } from './themeprovider'
import { Github, ExternalLink } from 'lucide-react'

const projects = [
  {
    title: 'Real Estate Platform',
    description: 'A modern web application for real estate listings built with Next.js, featuring dynamic property search, user authentication, and responsive design.',
    tech: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    github: 'https://github.com/yourusername/real-estate',
    demo: 'https://real-estate-demo.com',
    image: '/real-estate-preview.jpg'
  },
  {
    title: 'Sniper4Crypto',
    description: 'Advanced crypto analysis tool using data mining and machine learning for detecting trending meme tokens. Features real-time notifications via Telegram.',
    tech: ['Python', 'Scikit-learn', 'MongoDB', 'Telegram API'],
    github: 'https://github.com/yourusername/sniper4crypto',
    demo: 'https://sniper4crypto.com',
    image: '/crypto-preview.jpg'
  },
  {
    title: 'Trading Bot',
    description: 'Automated trading system with market analysis, strategy implementation, and real-time alerts. Includes backtesting and paper trading capabilities.',
    tech: ['Python', 'Exchange APIs', 'Technical Analysis', 'Telegram API'],
    github: 'https://github.com/yourusername/trading-bot',
    demo: 'https://trading-bot-demo.com',
    image: '/trading-preview.jpg'
  }
]

export function Projects() {
  const { theme } = useTheme()
  
  return (
    <section id="projects" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Featured Projects
          </h2>
          
          <div className="space-y-16">
            {projects.map((project, index) => (
              <div key={project.title} className={`flex flex-col lg:flex-row gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Project Image */}
                <div className="lg:w-1/2">
                  <div className={`rounded-lg shadow-lg overflow-hidden aspect-video ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="lg:w-1/2 space-y-4">
                  <h3 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {project.title}
                  </h3>
                  
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          theme === 'dark'
                            ? 'bg-gray-800 text-gray-200'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors duration-200`}
                    >
                      <Github className="h-5 w-5" />
                      <span>Code</span>
                    </a>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors duration-200`}
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Live Demo</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}