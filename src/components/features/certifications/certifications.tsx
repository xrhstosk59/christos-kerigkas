'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// ✅ CERTIFICATION TYPE
interface Certification {
  id: string
  title: string
  issuer: string
  issueDate?: string
  filename?: string
  credentialUrl?: string
  description?: string
  skills?: string[]
  type?: string
  featured?: boolean
}

// ✅ LOADING SKELETON - Pure Tailwind
function CertificationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

// ✅ CERTIFICATION CARD - FIXED for hydration
function CertificationCard({ cert }: { cert: Certification }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Static version until mounted
  if (!mounted) {
    return (
      <div className="border border-border rounded-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-card hover:bg-card/90">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {cert.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {cert.issuer}
        </p>
        {cert.issueDate && (
          <p className="text-xs text-muted-foreground mb-3">
            {new Date(cert.issueDate).toLocaleDateString()}
          </p>
        )}
        {cert.description && (
          <p className="text-sm text-card-foreground mb-4">
            {cert.description}
          </p>
        )}
        {cert.skills && cert.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {cert.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {cert.filename && (
            <a
              href={`/uploads/certificates/${cert.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View Certificate
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </a>
          )}
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Verify Online
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    )
  }

  // Theme-dependent version after mounted
  return (
    <div className={`
      border border-border rounded-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg
      ${theme === 'dark' ? 'bg-card hover:bg-card/80' : 'bg-card hover:bg-card/90'}
    `}>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        {cert.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {cert.issuer}
      </p>
      {cert.issueDate && (
        <p className="text-xs text-muted-foreground mb-3">
          {new Date(cert.issueDate).toLocaleDateString()}
        </p>
      )}
      {cert.description && (
        <p className="text-sm text-card-foreground mb-4">
          {cert.description}
        </p>
      )}
      {cert.skills && cert.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {cert.skills.map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        {cert.filename && (
          <a
            href={`/uploads/certificates/${cert.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View Certificate
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </a>
        )}
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Verify Online
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

// ✅ MAIN CERTIFICATIONS COMPONENT - FIXED for hydration
export function Certifications() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/certifications', {
          cache: 'no-store', // Prevent caching issues
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch certifications')
        }
        
        const data = await response.json()
        setCertifications(data)
      } catch (err) {
        console.error('Error fetching certifications:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  // Static version until mounted
  if (!mounted) {
    return (
      <section 
        id="certifications" 
        className="py-24 transition-colors duration-200 bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* ✅ SECTION HEADER */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Certifications
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Professional certifications and achievements
            </p>
          </div>

          {/* ✅ CONTENT */}
          {loading && <CertificationsSkeleton />}
          
          {error && (
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive font-medium mb-4">Error loading certifications</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && certifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No certifications found.</p>
            </div>
          )}

          {!loading && !error && certifications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <CertificationCard key={cert.id} cert={cert} />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  // Theme-dependent version after mounted
  return (
    <section 
      id="certifications" 
      className={`py-24 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-background' : 'bg-muted/30'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ✅ SECTION HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Certifications
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional certifications and achievements
          </p>
        </div>

        {/* ✅ CONTENT */}
        {loading && <CertificationsSkeleton />}
        
        {error && (
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-destructive font-medium mb-4">Error loading certifications</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && certifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No certifications found.</p>
          </div>
        )}

        {!loading && !error && certifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}