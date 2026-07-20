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
        <div className="rounded-2xl border border-border bg-muted shadow-lg overflow-hidden aspect-video">
          {renderImage(project.image, project.title)}
        </div>
      </div>
      
      <div className="lg:w-1/2 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
            {project.title}
          </h3>

          {project.status && (
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded",
              project.status === 'Completed'
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : project.status === 'In Progress'
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                : project.status === 'In Development'
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-muted text-muted-foreground"
            )}>
              {project.status}
            </span>
          )}
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
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