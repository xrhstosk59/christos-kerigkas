// /src/components/projects/index.tsx
import { featuredProjects } from '@/content/projects'
import { Project } from '@/types/projects'
import ProjectList from './project-list'
import { cn } from '@/lib/utils'

// Τύπος των props
interface ProjectsProps {
  theme: 'light' | 'dark'
}

// Server Component για τα projects
export default function Projects({ theme }: ProjectsProps) {
  // Φορτώνουμε τα projects από το content
  // Σε μελλοντική έκδοση, αυτό μπορεί να αντικατασταθεί με κλήση στο repository
  const projects: Project[] = featuredProjects
  
  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
      <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl mb-16", 
        theme === 'dark' ? 'text-white' : 'text-gray-900')}
      >
        Featured Projects
      </h2>
      
      {/* Περνάμε τα δεδομένα στο client component για rendering και interactivity */}
      <ProjectList 
        projects={projects} 
        theme={theme} 
      />
    </div>
  )
}