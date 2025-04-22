"use client"

import { useTheme } from './theme-provider'
import { CertificationsServer } from './certifications-server'

export default function Certifications() {
  const { theme } = useTheme()
  
  return (
    <section id="certifications" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <CertificationsServer theme={theme} />
      </div>
    </section>
  )
}