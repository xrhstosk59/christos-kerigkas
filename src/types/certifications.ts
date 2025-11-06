//src/types/certifications.ts
export type CertificationType = 'course' | 'badge' | 'seminar' | 'conference' | 'certification';

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
  type: CertificationType;
  filename: string;
  featured?: boolean;
}