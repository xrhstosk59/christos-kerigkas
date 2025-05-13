// src/domains/certifications/models/certification.model.ts

import { InferModel } from 'drizzle-orm';
import { certifications } from '@/lib/db/schema/certifications';
import { CertificationType } from '@/types/certifications';

// Βασικοί τύποι που προέρχονται από το schema της βάσης δεδομένων
export type Certification = InferModel<typeof certifications, 'select'>;
export type NewCertification = InferModel<typeof certifications, 'insert'>;

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
export * from '@/lib/db/schema/certifications';
export type { CertificationType } from '@/types/certifications';