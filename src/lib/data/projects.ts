// src/data/projects.ts
import { type LucideIcon } from 'lucide-react';

export type ProjectCategory = 
  | 'web-development' 
  | 'mobile' 
  | 'crypto' 
  | 'education'
  | 'data-analysis'
  | 'real-estate'
  | 'animals'
  | 'portfolio';

export type ProjectStatus = 'concept' | 'research' | 'beta' | 'active-development' | 'production' | 'maintenance';

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
}

export interface CryptoProject {
  title: string;
  slug: string;
  icon: LucideIcon; // Χρησιμοποιώ LucideIcon αντί για any
  description: string;
  features: string[];
  tech: string[];
  github: string;
  status: string;
}