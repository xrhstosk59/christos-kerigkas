'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Download, ExternalLink, Eye } from 'lucide-react'
import type { Certification } from '@/types/certifications'
import { getCertificateUrl } from '@/lib/utils/storage'
import { PdfPreview } from '@/components/common/pdf-preview'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function CertificationsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
          <div className="mb-4 h-6 w-3/4 rounded bg-muted" />
          <div className="mb-3 h-4 w-1/2 rounded bg-muted" />
          <div className="mb-2 h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

interface CertificationCardProps {
  cert: Certification
  onPreview: (certification: Certification) => void
}

function CertificationCard({ cert, onPreview }: CertificationCardProps) {
  const hasPreview = Boolean(cert.filename)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <button
        type="button"
        onClick={() => hasPreview && onPreview(cert)}
        className="flex flex-1 flex-col text-left"
        disabled={!hasPreview}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{cert.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{cert.issuer}</p>
          </div>
          {hasPreview && (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </span>
          )}
        </div>

        {cert.issueDate && (
          <div className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {new Date(cert.issueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        )}

        {cert.description && (
          <p className="mb-4 line-clamp-3 text-sm leading-6 text-card-foreground/80">
            {cert.description}
          </p>
        )}

        {cert.skills && cert.skills.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {cert.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto text-sm text-primary">
          {hasPreview ? 'Click to preview certificate' : 'Certificate file is not available'}
        </div>
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        {hasPreview && (
          <>
            <button
              type="button"
              onClick={() => onPreview(cert)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <a
              href={getCertificateUrl(cert.filename)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <Download className="h-4 w-4" />
              Open File
            </a>
          </>
        )}

        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
            Verify Online
          </a>
        )}
      </div>
    </article>
  )
}

export function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/certifications', { cache: 'no-store' })

        if (!response.ok) {
          throw new Error('Failed to fetch certifications')
        }

        const data: Certification[] = await response.json()
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

  return (
    <section id="certifications" className="bg-muted/30 py-24 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Certifications
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional certifications and achievements
          </p>
        </div>

        {loading && <CertificationsSkeleton />}

        {error && (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md rounded-lg border border-destructive/20 bg-destructive/10 p-6">
              <p className="mb-4 font-medium text-destructive">Error loading certifications</p>
              <p className="mb-4 text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && certifications.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No certifications found.</p>
          </div>
        )}

        {!loading && !error && certifications.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <CertificationCard
                key={cert.id}
                cert={cert}
                onPreview={setSelectedCertification}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedCertification)}
        onOpenChange={(open) => !open && setSelectedCertification(null)}
      >
        <DialogContent className="max-w-5xl border-border bg-background p-0 sm:max-h-[90vh] sm:rounded-2xl">
          {selectedCertification && (
            <>
              <DialogHeader className="border-b border-border px-6 py-5 text-left">
                <DialogTitle className="pr-10 text-xl text-foreground">
                  {selectedCertification.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedCertification.issuer}
                  {selectedCertification.issueDate && (
                    <>
                      {' '}
                      •{' '}
                      {new Date(selectedCertification.issueDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="h-[70vh] bg-muted/30 p-4">
                <PdfPreview
                  fileUrl={getCertificateUrl(selectedCertification.filename)}
                  title={selectedCertification.title}
                  className="h-full w-full rounded-xl border border-border bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">
                {selectedCertification.credentialUrl && (
                  <a
                    href={selectedCertification.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify Online
                  </a>
                )}

                <a
                  href={getCertificateUrl(selectedCertification.filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Open in New Tab
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
