// src/domains/certifications/models/certification.model.ts

import type { Database } from '@/lib/db/database.types';
import { CertificationType } from '@/types/certifications';

// Βασικοί τύποι που προέρχονται από το schema της βάσης δεδομένων
export type Certification = Database['public']['Tables']['certifications']['Row'];
export type NewCertification = Database['public']['Tables']['certifications']['Insert'];

// Μοντέλο για τα αποτελέσματα ερωτημάτων
export interface CertificationsQueryResult {
  certifications: Certification[];
  total: number;
}

// Παράμετροι αναζήτησης
export interface CertificationsSearchParams {
  skill?: string;
  type?: CertificationType;
  featured?: boolean;
  limit?: number;
  sortBy?: 'issueDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Εξαγωγή
export type { CertificationType } from '@/types/certifications';