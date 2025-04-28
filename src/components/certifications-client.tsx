'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Certification } from '@/lib/db/schema';

// Ομαδοποίηση των πιστοποιήσεων ανά έτος
function groupCertificationsByYear(certifications: Certification[]) {
  const groupedCerts: Record<string, Certification[]> = {};
  
  certifications.forEach(cert => {
    const year = new Date(cert.issueDate).getFullYear().toString();
    if (!groupedCerts[year]) {
      groupedCerts[year] = [];
    }
    groupedCerts[year].push(cert);
  });
  
  // Ταξινόμηση των ετών σε φθίνουσα σειρά (το πιο πρόσφατο πρώτο)
  return Object.entries(groupedCerts)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, certs]) => ({
      year,
      certifications: certs.sort((a, b) => 
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      )
    }));
}

function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString('el-GR', options);
}

interface CertificationsClientProps {
  theme: string;
  certifications: Certification[];
}

export function CertificationsClient({ theme, certifications }: CertificationsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const groupedByYear = groupCertificationsByYear(certifications);
  
  const certificationTypes = [
    { id: "all", label: "Όλα" },
    { id: "course", label: "Μαθήματα" },
    { id: "badge", label: "Badges" },
    { id: "seminar", label: "Σεμινάρια" },
    { id: "conference", label: "Συνέδρια" },
  ];
  
  const filteredCertifications = activeTab === "all"
    ? groupedByYear
    : groupedByYear.map(group => ({
        year: group.year,
        certifications: group.certifications.filter(cert => cert.type === activeTab)
      })).filter(group => group.certifications.length > 0);
  
  const handleViewCertificate = (filename: string) => {
    window.open(`/uploads/certificates/${filename}`, '_blank');
  };
  
  const containerClasses = theme === 'dark' 
    ? 'text-white' 
    : 'text-gray-900';
  
  const headingClasses = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';
  
  const descriptionClasses = theme === 'dark'
    ? 'text-gray-300'
    : 'text-gray-600';
  
  const yearClasses = theme === 'dark'
    ? 'text-white border-gray-700'
    : 'text-gray-900 border-gray-200';
  
  const cardClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/40'
    : 'bg-white border-gray-200 hover:shadow-gray-200/60';
  
  const cardDescriptionClasses = theme === 'dark'
    ? 'text-gray-400'
    : 'text-gray-500';
  
  const subtextClasses = theme === 'dark'
    ? 'text-gray-400'
    : 'text-gray-500';
  
  const badgeClasses = theme === 'dark'
    ? 'bg-blue-900/30 text-blue-200 border-blue-800'
    : 'bg-blue-100 text-blue-800 border-blue-200';
  
  const skillBadgeClasses = theme === 'dark'
    ? 'bg-gray-700/50 text-gray-300 border-gray-600'
    : 'bg-gray-100 text-gray-800 border-gray-200';
  
  const buttonClasses = theme === 'dark'
    ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
    : 'border-gray-200 text-gray-700 hover:bg-gray-100';
  
  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className={`text-3xl font-bold mb-4 ${headingClasses}`}>
          Πιστοποιήσεις & Διακρίσεις
        </h2>
        <p className={`max-w-2xl mx-auto ${descriptionClasses}`}>
          Τα πιστοποιητικά και οι διακρίσεις μου από σεμινάρια, μαθήματα και συνέδρια.
        </p>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-center">
          <TabsList className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
            {certificationTypes.map(type => (
              <TabsTrigger 
                key={type.id} 
                value={type.id}
                className={theme === 'dark' 
                  ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400' 
                  : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500'
                }
              >
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {filteredCertifications.map(({ year, certifications }) => (
        <div key={year} className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 border-b pb-2 ${yearClasses}`}>{year}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: certifications.indexOf(cert) * 0.1 }}
              >
                <div className={`h-full flex flex-col rounded-lg border hover:shadow-md transition-shadow ${cardClasses}`}>
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-xl font-semibold ${headingClasses}`}>{cert.title}</h4>
                      {cert.featured && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
                          Featured
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${cardDescriptionClasses}`}>
                      {cert.issuer} • {formatDate(cert.issueDate)}
                    </p>
                  </div>
                  <div className="p-4 flex-grow">
                    {cert.description && <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{cert.description}</p>}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cert.skills.map((skill) => (
                          <span key={skill} className={`px-2 py-1 rounded-full text-xs font-medium ${skillBadgeClasses}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t flex justify-between items-center">
                    <div className={`text-xs ${subtextClasses}`}>
                      {cert.credentialId && `ID: ${cert.credentialId}`}
                    </div>
                    <button 
                      className={`px-3 py-1 text-sm font-medium rounded-md border transition-colors ${buttonClasses}`}
                      onClick={() => handleViewCertificate(cert.filename)}
                    >
                      Προβολή
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}