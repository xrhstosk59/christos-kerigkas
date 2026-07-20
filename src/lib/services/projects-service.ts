// src/lib/services/projects-service.ts
import { getProjectRows, type ProjectRow } from '@/lib/content';
import {
  applyProjectCopyOverrides,
  getSupplementalProjectBySlug,
  mergePortfolioProjects,
} from '@/lib/data/project-copy';

type Project = ProjectRow;

/**
 * Παράμετροι αναζήτησης για projects.
 */
export interface ProjectsSearchParams {
  category?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: 'order' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Αποτέλεσμα με αριθμό αποτελεσμάτων για projects.
 */
export interface ProjectsResult {
  projects: Project[];
  total: number;
}

/**
 * Service για την ανάγνωση των projects.
 * Τα δεδομένα είναι στατικά (src/lib/content), οπότε δεν απαιτείται cache ή
 * πρόσβαση σε βάση δεδομένων.
 */
export const projectsService = {
  /**
   * Ανάκτηση projects με δυνατότητα φιλτραρίσματος.
   */
  async getProjects(params: ProjectsSearchParams): Promise<ProjectsResult> {
    const { category, featured, limit } = params;

    let projects = mergePortfolioProjects(getProjectRows());

    if (featured !== undefined) {
      projects = projects.filter(project => Boolean(project.featured) === featured);
    }

    if (category) {
      projects = projects.filter(project => project.categories?.includes(category));
    }

    if (limit && projects.length > limit) {
      projects = projects.slice(0, limit);
    }

    return {
      projects,
      total: projects.length,
    };
  },

  /**
   * Ανάκτηση ενός συγκεκριμένου project με βάση το slug.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const project = getProjectRows().find(row => row.slug === slug);

    if (project) {
      return applyProjectCopyOverrides(project);
    }

    const supplementalProject = getSupplementalProjectBySlug(slug);
    return supplementalProject ? applyProjectCopyOverrides(supplementalProject) : null;
  },
};
