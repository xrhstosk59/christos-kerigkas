// src/components/features/crypto/crypto-projects.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/utils'
import { CryptoProject } from '@/types/projects'
import { filteredCryptoProjects } from '@/lib/data/mock-projects'

export function CryptoProjects() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Wait for theme to be available
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determine the current theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'
  
  // Show loading state until theme is mounted
  if (!mounted) {
    return (
      <section id="crypto-projects" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-5xl">
            <div className="h-12 bg-muted rounded-lg mb-8 animate-pulse" />
            <div className="h-6 bg-muted rounded-md mb-16 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section 
      id="crypto-projects" 
      className={cn(
        "py-24 transition-colors duration-300",
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-5xl"
        >
          <h2 className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl text-center mb-4 transition-colors duration-300",
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Crypto & Trading Projects
          </h2>
          
          <p className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-colors duration-300",
            isDark ? 'text-gray-300' : 'text-gray-600'
          )}>
            Combining my passion for programming with financial markets to create automated 
            trading systems, market analysis tools, and cryptocurrency applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCryptoProjects.map((project: CryptoProject, index: number) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full flex flex-col transition-all duration-300 hover:shadow-lg border",
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600 shadow-gray-900/10' 
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-gray-900/5'
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        isDark ? 'bg-gray-700' : 'bg-blue-50'
                      )}>
                        <project.icon className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          isDark ? 'text-blue-400' : 'text-blue-500'
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded transition-colors duration-300",
                        project.status === 'Completed' || project.status === 'Active'
                          ? isDark 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-green-100 text-green-800'
                          : project.status === 'In Development'
                          ? isDark 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-blue-100 text-blue-800'
                          : isDark 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-800'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <CardTitle className={cn(
                      "transition-colors duration-300",
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {project.title}
                    </CardTitle>
                    <CardDescription className={cn(
                      "transition-colors duration-300",
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className={cn(
                      "text-sm font-medium mb-2 transition-colors duration-300",
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    )}>
                      Key Features:
                    </h4>
                    <ul className="space-y-1 mb-4">
                      {project.features.map((feature: string, i: number) => (
                        <li 
                          key={i}
                          className={cn(
                            "text-sm flex items-start transition-colors duration-300",
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          )}
                        >
                          <span className="mr-2 mt-0.5 flex-shrink-0">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tech.map((tech: string) => (
                        <span
                          key={tech}
                          className={cn(
                            "inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 transition-colors duration-300",
                            isDark 
                              ? 'bg-gray-700 text-gray-200 border border-gray-600' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          )}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        variant={isDark ? 'outline' : 'default'} 
                        className={cn(
                          "w-full transition-all duration-300",
                          isDark 
                            ? 'border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500' 
                            : 'hover:bg-primary/90'
                        )}
                      >
                        <Cpu className="mr-2 h-4 w-4" />
                        View Project
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CryptoProjects