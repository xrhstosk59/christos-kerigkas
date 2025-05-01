'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CVData } from '@/types/cv'
import { X, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CVFiltersProps {
  filters: {
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }>>
  cvData: CVData
}

export default function CVFilters({ filters, setFilters, cvData }: CVFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Collect all unique skills
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>()
    
    // From skills
    cvData.skills.forEach(skill => {
      skillsSet.add(skill.name)
    })
    
    // From experience
    cvData.experience.forEach(exp => {
      exp.technologies.forEach(tech => {
        skillsSet.add(tech)
      })
    })
    
    // From certifications
    cvData.certifications.forEach(cert => {
      if (cert.skills) {
        cert.skills.forEach(skill => {
          skillsSet.add(skill)
        })
      }
    })
    
    // From projects
    cvData.projects.forEach(project => {
      project.tech.forEach(tech => {
        skillsSet.add(tech)
      })
    })
    
    return Array.from(skillsSet).sort()
  }, [cvData])
  
  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return allSkills
    
    const query = searchQuery.toLowerCase()
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(query)
    )
  }, [allSkills, searchQuery])
  
  // Add/remove skill from filters
  const toggleSkill = (skill: string) => {
    setFilters(prev => {
      if (prev.skills.includes(skill)) {
        return {
          ...prev,
          skills: prev.skills.filter(s => s !== skill)
        }
      } else {
        return {
          ...prev,
          skills: [...prev.skills, skill]
        }
      }
    })
  }
  
  // Update years filter
  const handleYearsChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [type]: value
      }
    }))
  }
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      skills: [],
      categories: [],
      years: { min: 0, max: 10 }
    })
    setSearchQuery('')
  }
  
  // Calculate maximum years of experience
  const maxYearsOfExperience = useMemo(() => {
    let max = 0
    
    cvData.skills.forEach(skill => {
      if (skill.yearsOfExperience && skill.yearsOfExperience > max) {
        max = skill.yearsOfExperience
      }
    })
    
    // Round up to the next multiple of 5
    return Math.ceil(max / 5) * 5
  }, [cvData])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Filters
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the skills and characteristics you&#39;re interested in
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={filters.skills.length === 0 && filters.years.min === 0 && filters.years.max === maxYearsOfExperience}
          >
            <X className="h-4 w-4 mr-1" />
            <span>Reset filters</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills search */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Skills
          </h4>
          
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Selected skills */}
          {filters.skills.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected skills
              </h5>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map(skill => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-1 text-xs font-medium text-indigo-800 dark:text-indigo-300"
                  >
                    {skill}
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="ml-1 rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills list */}
          <div className="max-h-72 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredSkills.map(skill => (
                  <div 
                    key={skill}
                    className={`flex items-center gap-2 rounded-md p-2 cursor-pointer text-sm transition-colors
                      ${filters.skills.includes(skill)
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center
                      ${filters.skills.includes(skill)
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                        : 'border border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {filters.skills.includes(skill) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm p-2">
                No skills found matching your search criteria.
              </p>
            )}
          </div>
        </div>
        
        {/* Years of experience */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Years of experience
          </h4>
          
          <div className="space-y-6">
            {/* Min years */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="min-years" className="text-xs text-gray-700 dark:text-gray-300">
                  Minimum years: <span className="font-medium">{filters.years.min}</span>
                </label>
              </div>
              <input
                id="min-years"
                type="range"
                min="0"
                max={maxYearsOfExperience}
                step="1"
                value={filters.years.min}
                onChange={(e) => handleYearsChange('min', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 dark:accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>0</span>
                <span>{Math.floor(maxYearsOfExperience / 2)}</span>
                <span>{maxYearsOfExperience}</span>
              </div>
            </div>
            
            {/* Max years */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="max-years" className="text-xs text-gray-700 dark:text-gray-300">
                  Maximum years: <span className="font-medium">{filters.years.max}</span>
                </label>
              </div>
              <input
                id="max-years"
                type="range"
                min="0"
                max={maxYearsOfExperience}
                step="1"
                value={filters.years.max}
                onChange={(e) => handleYearsChange('max', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 dark:accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>0</span>
                <span>{Math.floor(maxYearsOfExperience / 2)}</span>
                <span>{maxYearsOfExperience}</span>
              </div>
            </div>
          </div>
          
          {/* Preset filters */}
          <div className="mt-6">
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preset filters
            </h5>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  years: { min: 0, max: maxYearsOfExperience }
                }))}
              >
                All years
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  years: { min: 3, max: maxYearsOfExperience }
                }))}
              >
                3+ years
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  years: { min: 5, max: maxYearsOfExperience }
                }))}
              >
                5+ years
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}