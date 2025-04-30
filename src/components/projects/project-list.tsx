'use client'

// /src/components/projects/project-list.tsx
import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import { OptimizedImage } from '@/components/optimizedimage'
import { Project } from '@/types/projects'
import { cn } from '@/lib/utils'
import ProjectCard from './project-card'

interface ProjectListProps {
  projects: Project[]
  theme: 'light' | 'dark'
}

// Client Component για τη λίστα των projects με animations και interactivity
export default function ProjectList({ projects, theme }: ProjectListProps) {
  // Συνάρτηση για rendering της εικόνας
  const renderImage = (src: string, alt: string) => (
    <OptimizedImage
      src={src}
      alt={alt}
      width={800}
      height={450}
      className="w-full h-full object-cover"
    />
  )

  // Συνάρτηση για rendering των tech badges
  const renderTechBadge = (tech: string, currentTheme: 'light' | 'dark') => (
    <motion.span
      key={tech}
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        currentTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-700'
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {tech}
    </motion.span>
  )

  // Συνάρτηση για rendering των project links
  const renderProjectLinks = (project: Pick<Project, 'github' | 'demo'>, currentTheme: 'light' | 'dark') => (
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
      
      {project.demo && (
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
      )}
    </>
  )
  
  return (
    <div className="space-y-16">
      {projects.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <ProjectCard 
            project={project}
            index={index}
            theme={theme}
            renderImage={renderImage}
            renderTechBadge={renderTechBadge}
            renderProjectLinks={renderProjectLinks}
          />
        </motion.div>
      ))}
    </div>
  )
}