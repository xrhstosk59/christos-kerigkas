'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from "next-themes"
import { Project, ProjectCategory } from '@/types/projects'
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react'
// Διόρθωση του μονοπατιού εισαγωγής
import { OptimizedImage } from '@/components/common/optimized-image'
import { Button } from '@/components/ui/button'

interface CVProjectsProps {
  projects: Project[]
  viewMode: 'compact' | 'detailed'
  filters: {
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }
}

export default function CVProjects({ projects, viewMode, filters }: CVProjectsProps) {
  useTheme()
  const [currentProject, setCurrentProject] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Collect all unique categories from projects
  const allCategories = useMemo(() => {
    const categories = new Set<string>()
    
    projects.forEach(project => {
      project.categories.forEach(category => {
        categories.add(category as unknown as string)
      })
    })
    
    return Array.from(categories).sort()
  }, [projects])
  
  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by category
      if (selectedCategory && !project.categories.some(cat => (cat as unknown as string) === selectedCategory)) {
        return false
      }
      
      // Filter by technologies
      if (filters.skills.length > 0 && !project.tech.some(tech => filters.skills.includes(tech))) {
        return false
      }
      
      return true
    })
  }, [projects, selectedCategory, filters])
  
  // Convert ProjectCategory to user-friendly name
  const getCategoryLabel = (category: ProjectCategory): string => {
    const categoryMap: Record<string, string> = {
      'web-development': 'Web Development',
      'mobile': 'Mobile',
      'crypto': 'Crypto',
      'education': 'Education',
      'data-analysis': 'Data Analysis',
      'real-estate': 'Real Estate',
      'animals': 'Animals',
      'portfolio': 'Portfolio'
    }
    
    return categoryMap[category as unknown as string] || (category as unknown as string)
  }
  
  // Handle previous project
  const handlePrevious = () => {
    setCurrentProject(prev => 
      prev === 0 ? filteredProjects.length - 1 : prev - 1
    )
  }
  
  // Handle next project
  const handleNext = () => {
    setCurrentProject(prev => 
      prev === filteredProjects.length - 1 ? 0 : prev + 1
    )
  }
  
  // Show message when no projects match filters
  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          No projects found matching your selected filters.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSelectedCategory(null)}
        >
          Reset filters
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={selectedCategory === null ? 'default' : 'outline'} 
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
        >
          All
        </Button>
        
        {allCategories.map(category => (
          <Button 
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'} 
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
          >
            {getCategoryLabel(category as unknown as ProjectCategory)}
          </Button>
        ))}
      </div>
      
      {viewMode === 'compact' ? (
        /* Carousel view for compact mode */
        <div className="relative">
          <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {filteredProjects.length > 0 && (
              <div className="relative">
                {/* Project image */}
                <div className="relative h-64 sm:h-80 md:h-96">
                  <OptimizedImage
                    src={filteredProjects[currentProject].image}
                    alt={filteredProjects[currentProject].title}
                    width={800}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Categories badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {filteredProjects[currentProject].categories.map(category => (
                      <span 
                        key={category as unknown as string} 
                        className="inline-flex items-center rounded-md bg-indigo-600/90 px-2 py-1 text-xs font-medium text-white"
                      >
                        {getCategoryLabel(category)}
                      </span>
                    ))}
                  </div>
                  
                  {/* Featured badge (if applicable) */}
                  {filteredProjects[currentProject].featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center rounded-md bg-amber-500/90 px-2 py-1 text-xs font-medium text-white">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Project details */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {filteredProjects[currentProject].title}
                  </h3>
                  
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {filteredProjects[currentProject].description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filteredProjects[currentProject].tech.map(tech => (
                      <span 
                        key={tech} 
                        className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <a 
                        href={filteredProjects[currentProject].github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4" />
                        <span>Code</span>
                      </a>
                    </Button>
                    
                    {filteredProjects[currentProject].demo && (
                      <Button 
                        variant="default" 
                        size="sm"
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        asChild
                      >
                        <a 
                          href={filteredProjects[currentProject].demo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Live Demo</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation arrows */}
          {filteredProjects.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 z-10 rounded-full h-10 w-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 z-10 rounded-full h-10 w-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          {/* Dots navigation */}
          {filteredProjects.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {filteredProjects.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    currentProject === index 
                      ? 'w-6 bg-indigo-600 dark:bg-indigo-500' 
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => setCurrentProject(index)}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Grid view for detailed mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div 
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Project image */}
              <div className="relative h-48">
                <OptimizedImage
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={300}
                  className="w-full h-full object-cover"
                />
                
                {/* Categories badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {project.categories.slice(0, 2).map(category => (
                    <span 
                      key={category as unknown as string} 
                      className="inline-flex items-center rounded-md bg-indigo-600/90 px-2 py-1 text-xs font-medium text-white"
                    >
                      {getCategoryLabel(category)}
                    </span>
                  ))}
                  
                  {project.categories.length > 2 && (
                    <span className="inline-flex items-center rounded-md bg-indigo-600/90 px-2 py-1 text-xs font-medium text-white">
                      +{project.categories.length - 2}
                    </span>
                  )}
                </div>
                
                {/* Featured badge (if applicable) */}
                {project.featured && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-md bg-amber-500/90 px-2 py-1 text-xs font-medium text-white">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              
              {/* Project details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {project.description}
                </p>
                
                {/* Technologies */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tech.slice(0, 6).map(tech => (
                    <span 
                      key={tech} 
                      className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                  
                  {project.tech.length > 6 && (
                    <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      +{project.tech.length - 6}
                    </span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  </Button>
                  
                  {project.demo && (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      asChild
                    >
                      <a 
                        href={project.demo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}