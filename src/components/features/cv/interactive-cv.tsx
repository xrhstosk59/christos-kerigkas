//src/components/features/cv/interactive-cv.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Filter, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CVData, ExportOptions } from '@/types/cv'
import { getCVData } from '@/lib/data/cv-data'
import { downloadCV } from '@/lib/utils/pdf-generator'
import CVTimeline from './cv-timeline'
import CVSkillsChart from './cv-skills-chart'
import CVCertifications from './cv-certifications'
import CVProjects from './cv-projects'
import CVExport from './cv-export'
import CVFilters from './cv-filters'
import Image from 'next/image'

// Ορισμός των props του component
interface InteractiveCVProps {
  initialCVData?: CVData;
}

export default function InteractiveCV({ initialCVData }: InteractiveCVProps) {
  const { theme } = useTheme()
  const [cvData, setCVData] = useState<CVData | null>(initialCVData || null)
  const [loading, setLoading] = useState(!initialCVData)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'compact' | 'detailed'>('detailed')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    skills: [] as string[],
    categories: [] as string[],
    years: { min: 2000, max: new Date().getFullYear() + 1 }
  })
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includePersonalInfo: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeCertifications: true,
    includeProjects: true,
    template: 'standard',
    colorScheme: theme === 'dark' ? 'dark' : 'light'
  })

  // Φόρτωση δεδομένων μόνο αν δεν έχουν δοθεί ως prop
  useEffect(() => {
    if (initialCVData) return; // Παράλειψη φόρτωσης αν τα δεδομένα έχουν δοθεί ως prop
    
    const loadCVData = async () => {
      try {
        setLoading(true)
        const data = await getCVData()
        setCVData(data)
      } catch (err) {
        console.error('Error loading CV data:', err)
        setError('Error loading data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadCVData()
  }, [initialCVData])

  // Update colorScheme when theme changes
  useEffect(() => {
    setExportOptions(prev => ({
      ...prev,
      colorScheme: theme === 'dark' ? 'dark' : 'light'
    }))
  }, [theme])

  // Handle PDF export
  const handleExport = async () => {
    if (!cvData) return

    try {
      await downloadCV(cvData, exportOptions, `CV_${cvData.personalInfo.name.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Error exporting CV:', err)
      setError('Error exporting CV. Please try again later.')
    }
  }

  // If loading, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  // If no data
  if (!cvData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 dark:text-gray-400">No CV data found.</p>
      </div>
    )
  }

  return (
    <div className={`cv-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* Header with title, view options and export button */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Interactive CV
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Browse through my professional journey, skills, and projects.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X size={16} /> : <Filter size={16} />}
            <span>{showFilters ? 'Close filters' : 'Filters'}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setActiveView(activeView === 'compact' ? 'detailed' : 'compact')}
          >
            <Eye size={16} />
            <span>{activeView === 'compact' ? 'Detailed view' : 'Compact view'}</span>
          </Button>
          <Button 
            variant="default" 
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
            onClick={handleExport}
          >
            <Download size={16} />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <CVFilters 
              filters={filters}
              setFilters={setFilters}
              cvData={cvData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal info and profile picture */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {cvData.personalInfo.profileImage && (
              <div className="flex-shrink-0">
                <Image 
                  src={cvData.personalInfo.profileImage} 
                  alt={cvData.personalInfo.name}
                  width={112} // 28*4
                  height={112} // 28*4
                  className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500 dark:border-indigo-400"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cvData.personalInfo.name}
              </h2>
              <p className="text-xl text-indigo-600 dark:text-indigo-400">
                {cvData.personalInfo.title}
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {cvData.personalInfo.bio}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                {cvData.personalInfo.email && (
                  <a 
                    href={`mailto:${cvData.personalInfo.email}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {cvData.personalInfo.email}
                  </a>
                )}
                {cvData.personalInfo.website && (
                  <a 
                    href={cvData.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {cvData.personalInfo.website}
                  </a>
                )}
                {cvData.personalInfo.location && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {cvData.personalInfo.location}
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                {cvData.personalInfo.socialLinks?.linkedin && (
                  <a 
                    href={cvData.personalInfo.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  </a>
                )}
                {cvData.personalInfo.socialLinks?.github && (
                  <a 
                    href={cvData.personalInfo.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue="experience" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="experience" className="mt-0">
          <CVTimeline 
            experience={cvData.experience} 
            education={cvData.education}
            viewMode={activeView}
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="skills" className="mt-0">
          <CVSkillsChart 
            skills={cvData.skills}
            viewMode={activeView}
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="certifications" className="mt-0">
          <CVCertifications 
            certifications={cvData.certifications}
            viewMode={activeView}
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-0">
          <CVProjects 
            projects={cvData.projects}
            viewMode={activeView}
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="export" className="mt-0">
          <CVExport 
            exportOptions={exportOptions}
            setExportOptions={setExportOptions}
            onExport={handleExport}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}