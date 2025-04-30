// /src/components/certifications/certification-card.tsx
import { ExternalLink, Download } from 'lucide-react'
import { Certification } from '@/types/certifications'
import { cn } from '@/lib/utils'

interface CertificationCardProps {
  certification: Certification
  theme: 'dark' | 'light'
  onClick: () => void
}

// Server Component για το rendering της κάρτας
export default function CertificationCard({ 
  certification, 
  theme,
  onClick
}: CertificationCardProps) {
  // Δημιουργία ενός Date object από το string της ημερομηνίας
  const issueDate = new Date(certification.issueDate);
  
  return (
    <div
      className={cn(
        "p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer",
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      )}
      onClick={onClick}
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
            {issueDate.toLocaleDateString('en-US', {
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
    </div>
  )
}