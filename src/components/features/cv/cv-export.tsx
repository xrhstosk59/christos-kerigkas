'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/theme-provider'
import { ExportOptions } from '@/types/cv'
import { Download, FileText, Moon, Sun, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CVExportProps {
  exportOptions: ExportOptions
  setExportOptions: React.Dispatch<React.SetStateAction<ExportOptions>>
  onExport: () => void
}

export default function CVExport({ exportOptions, setExportOptions, onExport }: CVExportProps) {
  const { theme } = useTheme()
  
  // Handle option changes
  const handleToggleOption = (option: keyof ExportOptions) => {
    if (typeof exportOptions[option] === 'boolean') {
      setExportOptions(prev => ({
        ...prev,
        [option]: !prev[option]
      }))
    }
  }
  
  // Handle template change
  const handleTemplateChange = (template: 'minimal' | 'standard' | 'detailed') => {
    setExportOptions(prev => ({
      ...prev,
      template
    }))
  }
  
  // Handle color scheme change
  const handleColorSchemeChange = (colorScheme: 'light' | 'dark' | 'colorful') => {
    setExportOptions(prev => ({
      ...prev,
      colorScheme
    }))
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export CV to PDF
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Select the sections you want to include in your CV and customize its appearance.
        </p>
        
        <div className="space-y-6">
          {/* Section options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Sections
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includePersonalInfo 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includePersonalInfo')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includePersonalInfo}
                  onChange={() => handleToggleOption('includePersonalInfo')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Personal Information
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includeExperience 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includeExperience')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includeExperience}
                  onChange={() => handleToggleOption('includeExperience')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Professional Experience
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includeEducation 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includeEducation')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includeEducation}
                  onChange={() => handleToggleOption('includeEducation')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Education
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includeSkills 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includeSkills')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includeSkills}
                  onChange={() => handleToggleOption('includeSkills')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Skills
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includeCertifications 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includeCertifications')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includeCertifications}
                  onChange={() => handleToggleOption('includeCertifications')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Certifications
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer
                  ${exportOptions.includeProjects 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleOption('includeProjects')}
              >
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  checked={exportOptions.includeProjects}
                  onChange={() => handleToggleOption('includeProjects')}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Projects
                </span>
              </motion.div>
            </div>
          </div>
          
          {/* Template options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Template
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <motion.div 
                className={`rounded-md border p-4 cursor-pointer
                  ${exportOptions.template === 'minimal' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateChange('minimal')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Minimal
                  </span>
                  <input 
                    type="radio" 
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                    checked={exportOptions.template === 'minimal'}
                    onChange={() => handleTemplateChange('minimal')}
                  />
                </div>
                <div className="flex space-x-1">
                  <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-4/12 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-8/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-6/12 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-6/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  Concise, minimalist resume with fewer details.
                </p>
              </motion.div>
              
              <motion.div 
                className={`rounded-md border p-4 cursor-pointer
                  ${exportOptions.template === 'standard' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateChange('standard')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Standard
                  </span>
                  <input 
                    type="radio" 
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                    checked={exportOptions.template === 'standard'}
                    onChange={() => handleTemplateChange('standard')}
                  />
                </div>
                <div className="flex space-x-1">
                  <div className="h-8 w-3/12 bg-indigo-200 dark:bg-indigo-800 rounded-l" />
                  <div className="h-8 w-9/12 bg-gray-200 dark:bg-gray-700 rounded-r" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-3/12 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-3/12 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  Balanced resume with most important information.
                </p>
              </motion.div>
              
              <motion.div 
                className={`rounded-md border p-4 cursor-pointer
                  ${exportOptions.template === 'detailed' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateChange('detailed')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Detailed
                  </span>
                  <input 
                    type="radio" 
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                    checked={exportOptions.template === 'detailed'}
                    onChange={() => handleTemplateChange('detailed')}
                  />
                </div>
                <div className="flex space-x-1">
                  <div className="h-8 w-3/12 bg-indigo-200 dark:bg-indigo-800 rounded-l" />
                  <div className="h-8 w-9/12 bg-gray-200 dark:bg-gray-700 rounded-r" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-3/12 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-3/12 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="h-4 w-3/12 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  Comprehensive resume with all details and descriptions.
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* Color scheme options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Color Scheme
            </h4>
            
            <div className="flex flex-wrap gap-3">
              <motion.div 
                className={`flex flex-col items-center justify-center rounded-md border p-4 cursor-pointer w-24
                  ${exportOptions.colorScheme === 'light' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorSchemeChange('light')}
              >
                <Sun className="h-8 w-8 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Light
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex flex-col items-center justify-center rounded-md border p-4 cursor-pointer w-24
                  ${exportOptions.colorScheme === 'dark' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorSchemeChange('dark')}
              >
                <Moon className="h-8 w-8 text-gray-700 dark:text-gray-300 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark
                </span>
              </motion.div>
              
              <motion.div 
                className={`flex flex-col items-center justify-center rounded-md border p-4 cursor-pointer w-24
                  ${exportOptions.colorScheme === 'colorful' 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorSchemeChange('colorful')}
              >
                <Palette className="h-8 w-8 text-gray-700 dark:text-gray-300 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Colorful
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview and export button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ready to export?
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Your CV will be exported as a PDF based on your selections.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Reset options to default values
              setExportOptions({
                includePersonalInfo: true,
                includeExperience: true,
                includeEducation: true,
                includeSkills: true,
                includeCertifications: true,
                includeProjects: true,
                template: 'standard',
                colorScheme: theme === 'dark' ? 'dark' : 'light',
              })
            }}
          >
            <FileText className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          
          <Button 
            variant="default"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>
    </div>
  )
}