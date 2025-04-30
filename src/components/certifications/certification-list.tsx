'use client'

// /src/components/certifications/certification-list.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Certification } from '@/types/certifications'
import CertificationCard from './certification-card'
import CertificationDialog from './certification-dialog'

interface CertificationListProps {
  certifications: Certification[]
  theme: 'dark' | 'light'
}

// Client Component για τη λίστα των πιστοποιήσεων με interactivity και animations
export default function CertificationList({ 
  certifications, 
  theme 
}: CertificationListProps) {
  // State για το επιλεγμένο πιστοποιητικό και την κατάσταση του dialog
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Άνοιγμα του dialog με το συγκεκριμένο πιστοποιητικό
  const openCertificateDialog = (certification: Certification) => {
    setSelectedCertification(certification)
    setIsDialogOpen(true)
  }
  
  // Κλείσιμο του dialog
  const closeDialog = () => {
    setIsDialogOpen(false)
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
          >
            <CertificationCard 
              certification={certification}
              theme={theme}
              onClick={() => openCertificateDialog(certification)}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Modal dialog για το επιλεγμένο πιστοποιητικό */}
      <CertificationDialog 
        certification={selectedCertification} 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        theme={theme} 
      />
    </div>
  )
}