// src/types/projects.ts
export type ProjectCategory = 
  | 'web-development' 
  | 'mobile' 
  | 'education'
  | 'data-analysis'
  | 'real-estate'
  | 'animals'
  | 'portfolio';

export type ProjectStatus = 'In Development' | 'In Progress' | 'Completed' | 'Maintenance';

export interface TechStack {
  name: string;
  icon?: string | null; // Προσθήκη null για exactOptionalPropertyTypes
  url?: string | null; // Προσθήκη null για exactOptionalPropertyTypes
}

export interface ProjectImage {
  src: string;
  alt: string;
  width?: number | null; // Προσθήκη null για exactOptionalPropertyTypes
  height?: number | null; // Προσθήκη null για exactOptionalPropertyTypes
}

export interface Project {
  title: string;
  slug: string;
  description: string;
  categories: ProjectCategory[];
  tech: string[];
  github: string | null; // Προσθήκη null για Supabase compatibility
  demo?: string | null; // Προσθήκη null για exactOptionalPropertyTypes
  image: string;
  featured?: boolean | null; // Προσθήκη null για exactOptionalPropertyTypes
  status?: ProjectStatus | null; // Προσθήκη null για exactOptionalPropertyTypes
  id?: number | null; // Συχνά χρειάζεται το id
}

// Ενημερωμένος τύπος για τις παραμέτρους αναζήτησης
export interface ProjectsSearchParams {
  sortBy: "title" | "order";
  sortOrder: "desc" | "asc";
  featured: boolean | null; // Προσθήκη null για exactOptionalPropertyTypes
  category: string | null; // Προσθήκη null για exactOptionalPropertyTypes
  limit: number | null; // Προσθήκη null για exactOptionalPropertyTypes
}
