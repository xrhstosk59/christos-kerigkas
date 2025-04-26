'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Experience, Education } from '@/types/cv'
import { ChevronDown, ChevronUp, Briefcase, GraduationCap, Calendar, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CVTimelineProps {
  experience: Experience[]
  education: Education[]
  viewMode: 'compact' | 'detailed'
  filters: {
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }
}

export default function CVTimeline({ experience, education, viewMode, filters }: CVTimelineProps) {
  const [expandedExperience, setExpandedExperience] = useState<string[]>([])
  const [expandedEducation, setExpandedEducation] = useState<string[]>([])
  const [view, setView] = useState<'all' | 'experience' | 'education'>('all')

  // Φιλτράρισμα εμπειρίας με βάση τις τεχνολογίες
  const filteredExperience = experience.filter(exp => {
    if (filters.skills.length === 0) return true
    return exp.technologies.some(tech => filters.skills.includes(tech))
  })

  // Άνοιγμα/κλείσιμο καρτών εμπειρίας
  const toggleExperience = (id: string) => {
    setExpandedExperience(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  // Άνοιγμα/κλείσιμο καρτών εκπαίδευσης
  const toggleEducation = (id: string) => {
    setExpandedEducation(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  // Μετατροπή ημερομηνίας από string σε αντικείμενο Date
  const parseDate = (dateString: string | null): Date | null => {
    if (!dateString) return null
    return new Date(dateString)
  }

  return (
    <div className="space-y-6">
      {/* Κουμπιά φιλτραρίσματος περιεχομένου */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={view === 'all' ? 'default' : 'outline'} 
          onClick={() => setView('all')}
          className={view === 'all' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
        >
          Όλα
        </Button>
        <Button 
          variant={view === 'experience' ? 'default' : 'outline'} 
          onClick={() => setView('experience')}
          className={view === 'experience' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Επαγγελματική Εμπειρία
        </Button>
        <Button 
          variant={view === 'education' ? 'default' : 'outline'} 
          onClick={() => setView('education')}
          className={view === 'education' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Εκπαίδευση
        </Button>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Timeline center line */}
        <div 
          className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" 
          style={{ transform: 'translateX(-50%)' }}
        ></div>

        {/* Επαγγελματική Εμπειρία */}
        {(view === 'all' || view === 'experience') && (
          <div className="mb-10">
            {view === 'all' && (
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Επαγγελματική Εμπειρία
              </h2>
            )}
            
            <div className="space-y-6">
              {filteredExperience.length > 0 ? (
                filteredExperience.map((exp) => (
                  <div key={exp.id} className="relative pl-14">
                    {/* Timeline dot */}
                    <div className="absolute left-5 top-1 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {/* Experience card */}
                    <motion.div 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Header */}
                      <div 
                        className={`p-4 cursor-pointer ${
                          expandedExperience.includes(exp.id) ? 'border-b border-gray-200 dark:border-gray-700' : ''
                        }`}
                        onClick={() => toggleExperience(exp.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {exp.position}
                            </h3>
                            <p className="text-indigo-600 dark:text-indigo-400">{exp.company}</p>
                            
                            {/* Ημερομηνία και τοποθεσία */}
                            <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {parseDate(exp.startDate)?.toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })} - {' '}
                                  {exp.endDate 
                                    ? parseDate(exp.endDate)?.toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                                    : 'Σήμερα'
                                  }
                                </span>
                              </div>
                              
                              {exp.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{exp.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand/collapse indicator */}
                          <div className="text-gray-500 dark:text-gray-400">
                            {expandedExperience.includes(exp.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                        
                        {/* Συνοπτική περιγραφή (για compact view) */}
                        {!expandedExperience.includes(exp.id) && viewMode === 'compact' && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                        
                        {/* Τεχνολογίες (πάντα ορατές) */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {exp.technologies.map(tech => (
                            <span 
                              key={tech} 
                              className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {(expandedExperience.includes(exp.id) || viewMode === 'detailed') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-2">
                              {/* Περιγραφή */}
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {exp.description}
                              </p>
                              
                              {/* Αρμοδιότητες */}
                              {exp.responsibilities && exp.responsibilities.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Αρμοδιότητες
                                  </h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {exp.responsibilities.map((resp, idx) => (
                                      <li key={idx}>{resp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Επιτεύγματα */}
                              {exp.achievements && exp.achievements.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Επιτεύγματα
                                  </h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {exp.achievements.map((achievement, idx) => (
                                      <li key={idx}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Σύνδεσμος εταιρείας */}
                              {exp.companyUrl && (
                                <a 
                                  href={exp.companyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                                >
                                  Επισκεφθείτε την ιστοσελίδα
                                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 pl-14">
                  Δεν βρέθηκαν αποτελέσματα με βάση τα φίλτρα που έχετε επιλέξει.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Εκπαίδευση */}
        {(view === 'all' || view === 'education') && (
          <div>
            {view === 'all' && (
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Εκπαίδευση
              </h2>
            )}
            
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className="absolute left-5 top-1 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* Education card */}
                  <motion.div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div 
                      className={`p-4 cursor-pointer ${
                        expandedEducation.includes(edu.id) ? 'border-b border-gray-200 dark:border-gray-700' : ''
                      }`}
                      onClick={() => toggleEducation(edu.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {edu.degree} {edu.field}
                          </h3>
                          <p className="text-indigo-600 dark:text-indigo-400">{edu.institution}</p>
                          
                          {/* Ημερομηνία και τοποθεσία */}
                          <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>
                                {parseDate(edu.startDate)?.getFullYear()} - {' '}
                                {edu.endDate 
                                  ? parseDate(edu.endDate)?.getFullYear()
                                  : 'Σήμερα'
                                }
                              </span>
                            </div>
                            
                            {edu.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{edu.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Expand/collapse indicator */}
                        <div className="text-gray-500 dark:text-gray-400">
                          {expandedEducation.includes(edu.id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      
                      {/* Συνοπτική περιγραφή (για compact view) */}
                      {!expandedEducation.includes(edu.id) && viewMode === 'compact' && edu.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {(expandedEducation.includes(edu.id) || viewMode === 'detailed') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-2">
                            {/* Περιγραφή */}
                            {edu.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {edu.description}
                              </p>
                            )}
                            
                            {/* Βαθμός */}
                            {edu.gpa && (
                              <div className="mb-4">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  <strong>Βαθμός:</strong> {edu.gpa.toFixed(1)}/10
                                </span>
                              </div>
                            )}
                            
                            {/* Επιτεύγματα */}
                            {edu.achievements && edu.achievements.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Επιτεύγματα
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                  {edu.achievements.map((achievement, idx) => (
                                    <li key={idx}>{achievement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}