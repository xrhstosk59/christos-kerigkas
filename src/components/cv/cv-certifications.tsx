'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../theme-provider'
import { Certification } from '@/types/certifications'
import { Calendar, Award, ExternalLink, X, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CVCertificationsProps {
  certifications: Certification[]
  viewMode: 'compact' | 'detailed'
  filters: {
    skills: string[]
    categories: string[]
    years: { min: number; max: number }
  }
}

export default function CVCertifications({ certifications, viewMode, filters }: CVCertificationsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [openPreview, setOpenPreview] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  
  // Ανάκτηση μοναδικών τύπων πιστοποιήσεων
  const certificationTypes = Array.from(
    new Set(certifications.map(cert => cert.type))
  ).sort()
  
  // Φιλτράρισμα πιστοποιήσεων
  const filteredCertifications = certifications.filter(cert => {
    // Φιλτράρισμα με βάση τον τύπο
    if (filterType && cert.type !== filterType) {
      return false
    }
    
    // Φιλτράρισμα με βάση τα skills
    if (filters.skills.length > 0 && (!cert.skills || 
        !cert.skills.some((skill: string) => filters.skills.includes(skill)))) {
      return false
    }
    
    return true
  })
  
  // Ταξινόμηση πιστοποιήσεων (πιο πρόσφατα πρώτα)
  const sortedCertifications = [...filteredCertifications].sort((a, b) => 
    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  )
  
  // Τύπος πιστοποίησης σε ελληνικά
  const getCertificationTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'course': 'Μάθημα',
      'badge': 'Badge',
      'seminar': 'Σεμινάριο',
      'conference': 'Συνέδριο'
    }
    
    return typeMap[type] || type
  }
  
  // Άνοιγμα προεπισκόπησης πιστοποιητικού
  const handleOpenPreview = (cert: Certification) => {
    setSelectedCertification(cert)
    setOpenPreview(true)
  }
  
  // Κλείσιμο προεπισκόπησης
  const handleClosePreview = () => {
    setOpenPreview(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Φίλτρα τύπων πιστοποιήσεων */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={filterType === null ? 'default' : 'outline'} 
          onClick={() => setFilterType(null)}
          className={filterType === null ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
        >
          Όλα
        </Button>
        
        {certificationTypes.map(type => (
          <Button 
            key={type}
            variant={filterType === type ? 'default' : 'outline'} 
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}
          >
            {getCertificationTypeLabel(type)}
          </Button>
        ))}
      </div>
      
      {/* Πιστοποιήσεις */}
      {sortedCertifications.length > 0 ? (
        <div className={`grid grid-cols-1 ${viewMode === 'compact' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
          {sortedCertifications.map(cert => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                isDark ? 'border border-gray-700' : 'border border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cert.title}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400">{cert.issuer}</p>
                    
                    {/* Ημερομηνία και τύπος πιστοποίησης */}
                    <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(cert.issueDate).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        <span>{getCertificationTypeLabel(cert.type)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Περιγραφή */}
                {viewMode === 'detailed' && cert.description && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {cert.description}
                  </p>
                )}
                
                {/* Δεξιότητες */}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cert.skills.map((skill: string) => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Κουμπιά ενεργειών */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleOpenPreview(cert)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Προεπισκόπηση</span>
                  </Button>
                  
                  {cert.credentialUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Επαλήθευση</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Δεν βρέθηκαν πιστοποιήσεις που να ταιριάζουν με τα επιλεγμένα φίλτρα.
        </p>
      )}
      
      {/* Dialog προεπισκόπησης πιστοποιητικού */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {selectedCertification?.title}
              </span>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={handleClosePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {selectedCertification?.issuer} • {selectedCertification && new Date(selectedCertification.issueDate).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {selectedCertification && (
              <iframe 
                src={`/uploads/certificates/${selectedCertification.filename}`}
                className="w-full h-full border-0"
                title={selectedCertification.title}
              />
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            {selectedCertification && (
              <Button 
                variant="default"
                className="flex items-center gap-2"
                asChild
              >
                <a 
                  href={`/uploads/certificates/${selectedCertification.filename}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Άνοιγμα σε νέα καρτέλα</span>
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}