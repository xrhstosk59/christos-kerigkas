// src/components/projects.tsx
'use client'

import { useTheme } from './themeprovider'
import { Github, ExternalLink } from 'lucide-react'
import { OptimizedImage } from './optimizedimage'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ProjectsServer } from './projects-server'

export function Projects() {
  const { theme } = useTheme()

  const renderImage = (src: string, alt: string, index: number) => (
    <OptimizedImage
      src={src}
      alt={alt}
      width={800}
      height={450}
      className="w-full h-full object-cover"
    />
  )

  const renderTechBadge = (tech: string, currentTheme: 'light' | 'dark') => (
    <span
      key={tech}
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        currentTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-700'
      )}
    >
      {tech}
    </span>
  )

  const renderProjectLinks = (project: { github: string; demo: string }, currentTheme: 'light' | 'dark') => (
    <>
      <motion.a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-flex items-center gap-1 transition-colors duration-200",
          currentTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Github className="h-5 w-5" />
        <span>Code</span>
      </motion.a>
      <motion.a
        href={project.demo}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-flex items-center gap-1 transition-colors duration-200",
          currentTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ExternalLink className="h-5 w-5" />
        <span>Live Demo</span>
      </motion.a>
    </>
  )
  
  return (
    <motion.section 
      id="projects" 
      className={cn("py-24", theme === 'dark' ? 'bg-gray-950' : 'bg-white')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProjectsServer 
            theme={theme}
            renderImage={renderImage}
            renderTechBadge={renderTechBadge}
            renderProjectLinks={renderProjectLinks}
          />
        </motion.div>
      </div>
    </motion.section>
  )
}