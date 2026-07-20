// /src/components/projects/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/projects'
import ProjectList from './project-list'

// Τύπος των props
interface ProjectsProps {
  theme: 'light' | 'dark'
}

// Client Component για τα projects
export default function Projects({ theme }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/projects', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()
        setProjects(data.data.projects || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
      <div className="text-center mb-16">
        <p className="text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Selected Work
        </p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
          Projects
        </h2>
        <div aria-hidden="true" className="mt-6 mx-auto h-px w-16 bg-primary/60" />
        <p className="mt-6 text-lg text-muted-foreground">
          Selected university, personal, and exploratory projects across web, mobile, and desktop development.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-destructive font-medium mb-4">Error loading projects</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No projects found.
          </p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <ProjectList
          projects={projects}
          theme={theme}
        />
      )}
    </div>
  )
}
