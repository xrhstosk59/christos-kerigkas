// src/domains/projects/models/project.model.ts

import { InferModel } from 'drizzle-orm';
import { projects } from '@/lib/db/schema/projects';

// Βασικοί τύποι που προέρχονται από το schema της βάσης δεδομένων
export type Project = InferModel<typeof projects, 'select'>;
export type NewProject = InferModel<typeof projects, 'insert'>;

// Τύπος για τα αποτελέσματα των ερωτημάτων
export interface ProjectsQueryResult {
  projects: Project[];
  total: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Παράμετροι αναζήτησης
export interface ProjectsSearchParams {
  category?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'order' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Εξαγωγή
export * from '@/lib/db/schema/projects';