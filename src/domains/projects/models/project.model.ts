// src/domains/projects/models/project.model.ts

import type { Database } from '@/lib/db/database.types';

// Βασικοί τύποι που προέρχονται από το schema της βάσης δεδομένων
export type Project = Database['public']['Tables']['projects']['Row'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];

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