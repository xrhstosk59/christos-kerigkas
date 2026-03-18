'use client'

// /src/components/features/projects/project-list.tsx
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
// Διόρθωση μονοπατιού εισαγωγής
import { OptimizedImage } from '@/components/common/optimized-image'
import { Project, ProjectStatus } from '@/types/projects'
import { cn } from '@/lib/utils/utils'
import ProjectCard from './project-card'
import { Button } from '@/components/ui/button'

interface ProjectListProps {
  projects: Project[]
  theme: 'light' | 'dark'
}

type StatusFilter = 'all' | ProjectStatus

const STATUS_PRIORITY: Record<ProjectStatus, number> = {
  Completed: 0,
  'In Progress': 1,
  'In Development': 2,
  Maintenance: 3,
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  Completed: 'Completed',
  'In Progress': 'In Progress',
  'In Development': 'In Development',
  Maintenance: 'Maintenance',
}

// Client Component για τη λίστα των projects με animations και interactivity
export default function ProjectList({ projects, theme }: ProjectListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const availableStatuses = useMemo(() => {
    const statuses = new Set<ProjectStatus>()

    projects.forEach((project) => {
      if (project.status) {
        statuses.add(project.status)
      }
    })

    return Array.from(statuses).sort(
      (a, b) => STATUS_PRIORITY[a] - STATUS_PRIORITY[b]
    )
  }, [projects])

  const filteredProjects = useMemo(() => {
    const visibleProjects = statusFilter === 'all'
      ? projects
      : projects.filter((project) => project.status === statusFilter)

    return [...visibleProjects].sort((a, b) => {
      const left = a.status ? STATUS_PRIORITY[a.status] : Number.MAX_SAFE_INTEGER
      const right = b.status ? STATUS_PRIORITY[b.status] : Number.MAX_SAFE_INTEGER

      return left - right
    })
  }, [projects, statusFilter])

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
        href={project.github ?? undefined}
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
    <div className="space-y-10">
      <div className={cn(
        "rounded-2xl border px-4 py-4 shadow-sm",
        theme === 'dark'
          ? 'border-gray-800 bg-gray-900/70'
          : 'border-gray-200 bg-gray-50/90'
      )}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn(
              "text-sm font-semibold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Filter by project status
            </p>
            <p className={cn(
              "text-xs",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Completed projects appear first by default.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={cn(
                "rounded-full px-4",
                statusFilter === 'all'
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                  : 'border-border bg-background/80'
              )}
            >
              All
            </Button>
            {availableStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-4",
                  statusFilter === status
                    ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                    : 'border-border bg-background/80'
                )}
              >
                {STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-16">
      {filteredProjects.map((project, index) => (
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
    </div>
  )
}
