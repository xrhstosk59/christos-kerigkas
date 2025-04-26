// src/types/cv.ts
import { Certification } from "./certifications";
import { Project } from "./projects";

// Τύποι για την επαγγελματική εμπειρία
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null; // null αν είναι η τρέχουσα εργασία
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements?: string[];
  companyLogo?: string;
  location?: string;
  companyUrl?: string;
}

// Τύποι για τις δεξιότητες
export interface Skill {
  name: string;
  level: number; // Σε κλίμακα 1-10 ή 1-100
  category: SkillCategory;
  yearsOfExperience?: number;
  description?: string;
  icon?: string;
}

export type SkillCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'design'
  | 'languages'
  | 'frameworks'
  | 'tools'
  | 'soft-skills'
  | 'other';

// Τύποι για την εκπαίδευση
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  description?: string;
  logo?: string;
  location?: string;
  gpa?: number;
  achievements?: string[];
}

// Εξαγωγή του CV σε διάφορες μορφές
export interface ExportOptions {
  includePersonalInfo: boolean;
  includeExperience: boolean;
  includeEducation: boolean;
  includeSkills: boolean;
  includeCertifications: boolean;
  includeProjects: boolean;
  template: 'minimal' | 'standard' | 'detailed';
  colorScheme: 'light' | 'dark' | 'colorful';
}

// Όλα τα δεδομένα του βιογραφικού μαζί
export interface CVData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    bio: string;
    profileImage?: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      other?: { label: string; url: string }[];
    };
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  languages?: { language: string; proficiency: string }[];
  interests?: string[];
  references?: { name: string; position: string; company: string; contact: string }[];
}