'use client'

// /src/components/experience/experience-list.tsx
import { motion } from 'framer-motion'
import { FileCode2, LineChart, Bot } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface Project {
  name: string
  icon: string
  description: string
  keyFeatures: string[]
  tech: string[]
  status: string
  link: string
}

interface ExperienceListProps {
  projects: Project[]
  theme: 'light' | 'dark'
}

// Client Component για τη λίστα της εμπειρίας με animations
export default function ExperienceList({ projects, theme }: ExperienceListProps) {
  // Συνάρτηση για rendering των εικονιδίων
  const renderIcon = (iconName: string) => {
    const iconProps = { className: `w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}` }
    
    switch (iconName) {
      case 'FileCode2': return <FileCode2 {...iconProps} />
      case 'LineChart': return <LineChart {...iconProps} />
      case 'Bot': return <Bot {...iconProps} />
      default: return <FileCode2 {...iconProps} />
    }
  }
  
  return (
    <div className="mt-16 space-y-8">
      {projects.map((project, index) => (
        <motion.article
          key={project.name}
          className={cn(
            "p-6 rounded-lg shadow-sm hover:shadow-md transition-all",
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 rounded-lg",
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            )}>
              {renderIcon(project.icon)}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className={cn(
                  "text-lg font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {project.name}
                </h3>
                
                <span className={cn(
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                  'bg-blue-100 text-blue-700'
                )}>
                  {project.status}
                </span>
              </div>

              <p className={cn(
                "mt-2 text-base",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                {project.description}
              </p>

              <motion.ul 
                className="mt-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {project.keyFeatures.map((feature) => (
                  <motion.li
                    key={feature}
                    className={cn(
                      "flex items-center text-sm",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="mr-2">•</span>
                    {feature}
                  </motion.li>
                ))}
              </motion.ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech, techIndex) => (
                  <motion.span
                    key={tech}
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-100 text-gray-700'
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (techIndex * 0.05) }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              <motion.a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-4 inline-flex items-center text-sm font-medium",
                  theme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:text-indigo-500'
                )}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                View Project
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  )
}