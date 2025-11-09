// src/lib/data/cv-data.ts
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { CVData } from '@/types/cv';
import { Project, ProjectStatus } from '@/types/projects';
import type { Database } from '../db/database.types';
import { getProfileImageUrl } from '../utils/storage';

type DbProject = Database['public']['Tables']['projects']['Row'];

// Only basic contact info that doesn't change
function getPersonalInfo() {
  return {
    name: "Christos Kerigkas",
    title: "Computer Science Student | Full-Stack Web Developer",
    email: "contact@christoskerigkas.com",
    location: "Kavala, Greece",
    website: "https://christoskerigkas.com",
    bio: "4th-year Computer Science student at Democritus University of Thrace, passionate about web development.",
    profileImage: getProfileImageUrl(),
    socialLinks: {
      linkedin: "https://linkedin.com/in/christoskerigkas",
      github: "https://github.com/christoskerigkas",
    }
  };
}

// Convert projects from database schema to Project type
function mapProjectsFromDb(projects: DbProject[]): Project[] {
  return projects.map(project => ({
    title: project.title,
    slug: project.slug,
    description: project.description,
    categories: [],
    tech: project.tech,
    github: project.github,
    demo: project.live_url === null ? undefined : project.live_url,
    image: project.image,
    featured: project.featured,
    status: (project.status || 'Active') as ProjectStatus
  }));
}

/**
 * Get all CV data from database
 * All data (projects, certifications, skills, experience, education) should be stored in the database
 */
export async function getCVData(): Promise<CVData> {
  try {
    const projectsFromDb = await projectsRepository.findAll();
    const certificationsFromDb = await getCertifications();

    console.log(`[getCVData] Loaded ${certificationsFromDb.length} certifications from database`);
    console.log(`[getCVData] Loaded ${projectsFromDb.length} projects from database`);

    return {
      personalInfo: getPersonalInfo(),
      experience: [], // TODO: Add experience table to database
      education: [], // TODO: Add education table to database
      skills: [], // TODO: Add skills table to database
      certifications: certificationsFromDb,
      projects: mapProjectsFromDb(projectsFromDb),
      languages: [], // TODO: Add languages table to database
      interests: [] // TODO: Add interests table to database
    };
  } catch (error) {
    console.error("Error in getCVData:", error);
    return {
      personalInfo: getPersonalInfo(),
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: [],
      interests: []
    };
  }
}
