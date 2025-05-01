'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/theme-provider'
import { Skill, SkillCategory } from '@/types/cv'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Button } from '@/components/ui/button'

interface CVSkillsChartProps {
  skills: Skill[]
  viewMode: 'compact' | 'detailed'
  filters: {
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }
}

// Types for tooltips
interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      level: number;
      yearsOfExperience?: number;
      category: SkillCategory;
    };
  }>;
}

interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      category: string;
      value: number;
    };
  }>;
}

// Convert category to friendly name
const getCategoryLabel = (category: SkillCategory): string => {
  const categoryMap: Record<SkillCategory, string> = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'database': 'Databases',
    'devops': 'DevOps',
    'mobile': 'Mobile',
    'design': 'Design',
    'languages': 'Programming Languages',
    'frameworks': 'Frameworks',
    'tools': 'Tools',
    'soft-skills': 'Soft Skills',
    'other': 'Other'
  }
  
  return categoryMap[category] || category
}

// Colors for different skill categories
const getCategoryColor = (category: SkillCategory, isDark: boolean): string => {
  const categoryColors: Record<SkillCategory, { light: string, dark: string }> = {
    'frontend': { light: '#4F46E5', dark: '#818CF8' },
    'backend': { light: '#16A34A', dark: '#4ADE80' },
    'database': { light: '#9333EA', dark: '#C084FC' },
    'devops': { light: '#0891B2', dark: '#67E8F9' },
    'mobile': { light: '#D97706', dark: '#FBBF24' },
    'design': { light: '#DB2777', dark: '#F472B6' },
    'languages': { light: '#0369A1', dark: '#38BDF8' },
    'frameworks': { light: '#7C3AED', dark: '#A78BFA' },
    'tools': { light: '#15803D', dark: '#4ADE80' },
    'soft-skills': { light: '#9D174D', dark: '#F472B6' },
    'other': { light: '#374151', dark: '#9CA3AF' }
  }
  
  return isDark ? categoryColors[category]?.dark : categoryColors[category]?.light
}

export default function CVSkillsChart({ skills, viewMode, filters }: CVSkillsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar')
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  
  // Group skills by category
  const skillsByCategory = useMemo(() => {
    return skills.reduce<Record<SkillCategory, Skill[]>>((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<SkillCategory, Skill[]>)
  }, [skills])
  
  // Unique categories
  const categories = useMemo(() => {
    return Object.keys(skillsByCategory) as SkillCategory[]
  }, [skillsByCategory])
  
  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      // Filter by selected category
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
        return false
      }
      
      // Filter by selected skills
      if (filters.skills.length > 0 && !filters.skills.includes(skill.name)) {
        return false
      }
      
      // Filter by years of experience
      if (skill.yearsOfExperience !== undefined && 
          (skill.yearsOfExperience < filters.years.min || 
           skill.yearsOfExperience > filters.years.max)) {
        return false
      }
      
      return true
    })
  }, [skills, selectedCategory, filters])
  
  // Sorted skills for bar chart
  const sortedSkillsForBarChart = useMemo(() => {
    return [...filteredSkills]
      .sort((a, b) => b.level - a.level)
      .slice(0, 15) // Limit for better readability
      .map(skill => ({
        name: skill.name,
        level: skill.level,
        yearsOfExperience: skill.yearsOfExperience,
        category: skill.category,
        color: getCategoryColor(skill.category, isDark)
      }))
  }, [filteredSkills, isDark])
  
  // Data for radar chart
  const radarChartData = useMemo(() => {
    // Group and calculate average by category
    const categoryAverages: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}
    
    filteredSkills.forEach(skill => {
      const category = skill.category
      if (!categoryAverages[category]) {
        categoryAverages[category] = 0
        categoryCounts[category] = 0
      }
      
      categoryAverages[category] += skill.level
      categoryCounts[category] += 1
    })
    
    // Calculate average
    const data = Object.keys(categoryAverages).map(category => ({
      category: getCategoryLabel(category as SkillCategory),
      value: Math.round(categoryAverages[category] / categoryCounts[category]),
      fullMark: 100,
      color: getCategoryColor(category as SkillCategory, isDark)
    }))
    
    return data
  }, [filteredSkills, isDark])
  
  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: BarTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Level: <span className="font-medium">{data.level}/100</span></p>
          {data.yearsOfExperience !== undefined && (
            <p className="text-sm">Experience: <span className="font-medium">{data.yearsOfExperience} years</span></p>
          )}
          <p className="text-sm">Category: <span className="font-medium">{getCategoryLabel(data.category)}</span></p>
        </div>
      )
    }
    
    return null
  }
  
  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload }: RadarTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">Average level: <span className="font-medium">{data.value}/100</span></p>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div className="space-y-6">
      {/* Chart and category options */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={chartType === 'bar' ? 'default' : 'outline'} 
            onClick={() => setChartType('bar')}
            className={chartType === 'bar' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
          >
            Bar Chart
          </Button>
          <Button 
            variant={chartType === 'radar' ? 'default' : 'outline'} 
            onClick={() => setChartType('radar')}
            className={chartType === 'radar' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
          >
            Radar Chart
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'} 
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
          >
            All
          </Button>
          
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'} 
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        {filteredSkills.length > 0 ? (
          <div className="h-96 w-full">
            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedSkillsForBarChart}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tick={{ fill: isDark ? '#D1D5DB' : '#4B5563' }} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: isDark ? '#D1D5DB' : '#4B5563' }} 
                    width={80}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar 
                    dataKey="level" 
                    name="Level" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20}
                  >
                    {sortedSkillsForBarChart.map((entry, index) => (
                      <motion.rect 
                        key={`bar-${index}`}
                        fill={entry.color}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: isDark ? '#D1D5DB' : '#4B5563' }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: isDark ? '#D1D5DB' : '#4B5563' }} 
                  />
                  <Radar
                    name="Average level"
                    dataKey="value"
                    stroke={isDark ? '#818CF8' : '#4F46E5'}
                    fill={isDark ? '#818CF8' : '#4F46E5'}
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="h-96 w-full flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">
              No skills found matching your selected filters.
            </p>
          </div>
        )}
      </div>
      
      {/* Skills list */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories
            .filter(category => 
              selectedCategory === 'all' || category === selectedCategory
            )
            .map(category => {
              const categorySkills = skillsByCategory[category]
                .filter(skill => 
                  filters.skills.length === 0 || 
                  filters.skills.includes(skill.name)
                )
                .sort((a, b) => b.level - a.level)
              
              if (categorySkills.length === 0) return null
              
              return (
                <div 
                  key={category} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
                >
                  <div 
                    className="p-3 text-white font-medium"
                    style={{ backgroundColor: getCategoryColor(category, isDark) }}
                  >
                    {getCategoryLabel(category)}
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {categorySkills.map(skill => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {skill.name}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {skill.yearsOfExperience !== undefined && `${skill.yearsOfExperience} years`}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ 
                                backgroundColor: getCategoryColor(category, isDark),
                                width: `${skill.level}%`
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
            .filter(Boolean)}
        </div>
      )}
    </div>
  )
}