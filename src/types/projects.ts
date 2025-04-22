// src/types/projects.ts
import { LucideIcon } from 'lucide-react';

export type ProjectCategory = 
  | 'web-development' 
  | 'mobile' 
  | 'crypto' 
  | 'education'
  | 'data-analysis'
  | 'real-estate'
  | 'animals'
  | 'portfolio';

export type ProjectStatus = 'In Development' | 'Active' | 'Completed' | 'Maintenance';

export interface TechStack {
  name: string;
  icon?: string;
  url?: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Project {
  title: string;
  slug: string;
  description: string;
  categories: ProjectCategory[];
  tech: string[];
  github: string;
  demo?: string;
  image: string;
  featured?: boolean;
  status?: ProjectStatus;
}

export interface CryptoProject {
  title: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  tech: string[];
  github: string;
  status: ProjectStatus;
}