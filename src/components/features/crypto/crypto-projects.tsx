// src/components/crypto-projects.tsx
'use client'

import { useTheme } from './theme-provider'
import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { filteredCryptoProjects } from '@/content/projects'

export function CryptoProjects() {
  const { theme } = useTheme()
  
  return (
    <section 
      id="crypto-projects" 
      className={cn(
        "py-24",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
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
            "text-3xl font-bold tracking-tight sm:text-4xl text-center mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Crypto & Trading Projects
          </h2>
          
          <p className={cn(
            "text-center max-w-3xl mx-auto mb-16",
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Combining my passion for programming with financial markets to create automated 
            trading systems, market analysis tools, and cryptocurrency applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCryptoProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full flex flex-col transition-all duration-200 hover:shadow-md",
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg",
                        theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                      )}>
                        <project.icon className={cn(
                          "w-5 h-5",
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded",
                        project.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : project.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : project.status === 'In Development'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {project.title}
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className={cn(
                      "text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    )}>
                      Key Features:
                    </h4>
                    <ul className="space-y-1 mb-4">
                      {project.features.map((feature, i) => (
                        <li 
                          key={i}
                          className={cn(
                            "text-sm flex items-start",
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          )}
                        >
                          <span className="mr-2 mt-0.5">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className={cn(
                            "inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5",
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-200' 
                              : 'bg-gray-100 text-gray-700'
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
                        variant={theme === 'dark' ? 'outline' : 'default'} 
                        className="w-full"
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