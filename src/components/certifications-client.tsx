'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Download } from 'lucide-react'
import { Certification } from '@/types/certifications'
import { cn } from '@/lib/utils'

interface CertificationsClientProps {
  certifications: Certification[]
  theme: 'dark' | 'light'
}

export default function CertificationsClient({ certifications, theme }: CertificationsClientProps) {
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDialogOpen(false)
      }
    }

    if (isDialogOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDialogOpen])

  const openCertificateDialog = (certification: Certification) => {
    setSelectedCertification(certification)
    setIsDialogOpen(true)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((certification, index) => (
          <motion.div
            key={certification.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer",
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            )}
            onClick={() => openCertificateDialog(certification)}
          >
            <div className="flex flex-col h-full">
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {certification.title}
              </h3>
              
              <p className={cn(
                "text-sm mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                {certification.issuer}
              </p>
              
              <div className="mt-auto pt-4 flex justify-between items-center">
                <span className={cn(
                  "text-xs",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {new Date(certification.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </span>
                
                <div className="flex space-x-2">
                  {certification.credentialUrl && (
                    <a 
                      href={certification.credentialUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      )}
                      aria-label="View credential"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <a 
                    href={`/uploads/certificates/${certification.filename}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    )}
                    aria-label="Download certificate"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {isDialogOpen && selectedCertification && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div 
            className={cn(
              "w-full max-w-3xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto",
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            )}
          >
            <button
              onClick={() => setIsDialogOpen(false)}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full",
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className={cn(
              "text-xl font-bold mb-4",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {selectedCertification.title}
            </h2>
            
            <div className="aspect-[4/3] w-full mb-6">
              <iframe
                src={`/uploads/certificates/${selectedCertification.filename}`}
                className="w-full h-full rounded border"
                title={selectedCertification.title}
              ></iframe>
            </div>
            
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              <div>
                <h3 className={cn(
                  "text-sm font-semibold",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>Issuer</h3>
                <p className="text-base">{selectedCertification.issuer}</p>
              </div>
              
              <div>
                <h3 className={cn(
                  "text-sm font-semibold",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>Issue Date</h3>
                <p className="text-base">
                  {new Date(selectedCertification.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {selectedCertification.credentialId && (
                <div>
                  <h3 className={cn(
                    "text-sm font-semibold",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>Credential ID</h3>
                  <p className="text-base">{selectedCertification.credentialId}</p>
                </div>
              )}
              
              {selectedCertification.expirationDate && (
                <div>
                  <h3 className={cn(
                    "text-sm font-semibold",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>Expiration Date</h3>
                  <p className="text-base">
                    {new Date(selectedCertification.expirationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            
            {selectedCertification.description && (
              <div className="mb-6">
                <h3 className={cn(
                  "text-sm font-semibold mb-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>Description</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {selectedCertification.description}
                </p>
              </div>
            )}
            
            {selectedCertification.skills && selectedCertification.skills.length > 0 && (
              <div>
                <h3 className={cn(
                  "text-sm font-semibold mb-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCertification.skills.map((skill) => (
                    <span
                      key={skill}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full",
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-4">
              {selectedCertification.credentialUrl && (
                <a
                  href={selectedCertification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2",
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  )}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify</span>
                </a>
              )}
              
              <a
                href={`/uploads/certificates/${selectedCertification.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2",
                  theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                )}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}