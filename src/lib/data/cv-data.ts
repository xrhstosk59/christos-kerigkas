// src/lib/data/cv-data.ts
// Add 'use server' directive to ensure this file runs only on the server
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { CVData } from '@/types/cv';
import { Project, ProjectStatus } from '@/types/projects';
import type { Database } from '../db/database.types';
import { getProfileImageUrl } from '../utils/storage';

type DbProject = Database['public']['Tables']['projects']['Row'];

// Basic personal information - this is the only static data we keep
function getPersonalInfo() {
  return {
    name: "Christos Kerigkas",
    title: "Computer Science Student | Aspiring Full-Stack Web Developer",
    email: "contact@christoskerigkas.com",
    location: "Kavala (Studies) / Chalkidiki (Permanent)",
    website: "https://christoskerigkas.com",
    bio: "4th-year student in the Computer Science department at Democritus University of Thrace, passionate about web application development. I aim to grow as a Full-Stack Developer, combining knowledge from my studies with personal projects and work experience.",
    profileImage: getProfileImageUrl(),
    socialLinks: {
      linkedin: "https://linkedin.com/in/christoskerigkas",
      github: "https://github.com/christoskerigkas",
    }
  };
}

// Basic static data that doesn't change often
function getStaticData() {
  return {
    languages: [
      { language: "Greek", proficiency: "Native" },
      { language: "English", proficiency: "Excellent (C2)" }
    ],
    interests: [
      "Web Development",
      "Mobile App Development",
      "UI/UX Design",
      "Artificial Intelligence",
      "Game Development"
    ]
  };
}

// Convert projects from database schema to Project type
function mapProjectsFromDb(projects: DbProject[]): Project[] {
  return projects.map(project => ({
    title: project.title,
    slug: project.slug,
    description: project.description,
    categories: [], // Projects table doesn't have categories field
    tech: project.tech,
    github: project.github,
    demo: project.live_url === null ? undefined : project.live_url,
    image: project.image,
    featured: project.featured,
    status: (project.status || 'Active') as ProjectStatus
  }));
}

// Main function that collects all CV data from database
export async function getCVData(): Promise<CVData> {
  try {
    // Get all data from database
    const projectsFromDb = await projectsRepository.findAll();
    const certificationsFromDb = await getCertifications();

    console.log(`[getCVData] Loaded ${certificationsFromDb.length} certifications from database`);
    console.log(`[getCVData] Loaded ${projectsFromDb.length} projects from database`);

    const staticData = getStaticData();

    return {
      personalInfo: getPersonalInfo(),
      experience: [], // Empty for now - add when you have real experience data
      education: [], // Empty for now - add when you have real education data
      skills: [], // Empty for now - add when you have real skills data
      certifications: certificationsFromDb,
      projects: mapProjectsFromDb(projectsFromDb),
      languages: staticData.languages,
      interests: staticData.interests
    };
  } catch (error) {
    console.error("Error in getCVData:", error);
    // Return minimal data structure on error
    const staticData = getStaticData();
    return {
      personalInfo: getPersonalInfo(),
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: staticData.languages,
      interests: staticData.interests
    };
  }
}