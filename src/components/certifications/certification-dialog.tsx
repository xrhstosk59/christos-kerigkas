'use client'

// /src/components/certifications/certification-dialog.tsx
import { useEffect } from 'react'
import { ExternalLink, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Certification } from '@/types/certifications'

interface CertificationDialogProps {
  certification: Certification | null
  isOpen: boolean
  onClose: () => void
  theme: 'dark' | 'light'
}

// Client Component για το modal dialog
export default function CertificationDialog({ 
  certification, 
  isOpen, 
  onClose, 
  theme 
}: CertificationDialogProps) {
  // Κλείσιμο του dialog με το escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Αν δεν είναι ανοιχτό ή δεν έχει πιστοποίηση, μην εμφανίσεις τίποτα
  if (!isOpen || !certification) return null

  // Δημιουργία Date objects από τα strings
  const issueDate = new Date(certification.issueDate);
  const expirationDate = certification.expirationDate ? new Date(certification.expirationDate) : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className={cn(
          "w-full max-w-3xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto",
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <button
          onClick={onClose}
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
          {certification.title}
        </h2>
        
        <div className="aspect-[4/3] w-full mb-6">
          <iframe
            src={`/uploads/certificates/${certification.filename}`}
            className="w-full h-full rounded border"
            title={certification.title}
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
            <p className="text-base">{certification.issuer}</p>
          </div>
          
          <div>
            <h3 className={cn(
              "text-sm font-semibold",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>Issue Date</h3>
            <p className="text-base">
              {issueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          {certification.credentialId && (
            <div>
              <h3 className={cn(
                "text-sm font-semibold",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>Credential ID</h3>
              <p className="text-base">{certification.credentialId}</p>
            </div>
          )}
          
          {expirationDate && (
            <div>
              <h3 className={cn(
                "text-sm font-semibold",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>Expiration Date</h3>
              <p className="text-base">
                {expirationDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
        
        {certification.description && (
          <div className="mb-6">
            <h3 className={cn(
              "text-sm font-semibold mb-2",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>Description</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {certification.description}
            </p>
          </div>
        )}
        
        {certification.skills && certification.skills.length > 0 && (
          <div>
            <h3 className={cn(
              "text-sm font-semibold mb-2",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {certification.skills.map((skill) => (
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
          {certification.credentialUrl && (
            <a
              href={certification.credentialUrl}
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
            href={`/uploads/certificates/${certification.filename}`}
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
  )
}