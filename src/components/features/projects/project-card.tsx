// /src/components/projects/project-card.tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/utils'
import { Project } from '@/types/projects'

interface ProjectCardProps {
  project: Project
  index: number
  theme: 'light' | 'dark'
  renderImage: (src: string, alt: string) => ReactNode
  renderTechBadge: (tech: string, theme: 'light' | 'dark') => ReactNode
  renderProjectLinks: (project: Pick<Project, 'github' | 'demo'>, theme: 'light' | 'dark') => ReactNode
}

// Server Component για την κάρτα κάθε project
export default function ProjectCard({ 
  project, 
  index, 
  theme,
  renderImage,
  renderTechBadge,
  renderProjectLinks
}: ProjectCardProps) {
  return (
    <div 
      key={project.title}
      className={cn("flex flex-col lg:flex-row gap-8", 
        index % 2 === 1 ? 'lg:flex-row-reverse' : '')}
    >
      <div className="lg:w-1/2">
        <div className={cn("rounded-lg shadow-lg overflow-hidden aspect-video",
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
          {renderImage(project.image, project.title)}
        </div>
      </div>
      
      <div className="lg:w-1/2 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <h3 className={cn("text-2xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {project.title}
          </h3>

          <span className={cn(
            "text-xs font-medium px-2.5 py-1 rounded",
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
          )}>
            In Progress
          </span>
        </div>
        
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => renderTechBadge(tech, theme))}
        </div>
        
        <div className="flex gap-4 pt-4">
          {renderProjectLinks(project, theme)}
        </div>
      </div>
    </div>
  )
}