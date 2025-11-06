// /src/components/projects/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/projects'
import ProjectList from './project-list'
import { cn } from '@/lib/utils/utils'

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
      <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-center",
        theme === 'dark' ? 'text-white' : 'text-gray-900')}
      >
        Projects & Experience
      </h2>
      <p className={cn("text-center mb-16",
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}
      >
        A showcase of my academic and personal projects across various technologies
      </p>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-4">Error loading projects</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-12">
          <p className={cn("text-lg", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
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