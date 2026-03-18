// src/lib/data/cv-data.ts
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { getExperience } from '../db/repositories/experience-repository';
import { getEducation } from '../db/repositories/education-repository';
import { getSkills } from '../db/repositories/skills-repository';
import { CVData } from '@/types/cv';
import { Project, ProjectCategory, ProjectStatus } from '@/types/projects';
import { Certification } from '@/types/certifications';
import type { Database } from '../db/database.types';
import { getProfileImageUrl } from '../utils/storage';

type DbProject = Database['public']['Tables']['projects']['Row'];

const CV_PROJECT_ORDER = [
  'travel-planner',
  'bluewave-properties',
  'wait-less',
  'grade-calc',
] as const;

const CV_PROJECT_OVERRIDES: Partial<Record<(typeof CV_PROJECT_ORDER)[number], Partial<Project>>> = {
  'travel-planner': {
    title: "Travel Planner - AI-Powered Travel Platform (Bachelor's Thesis)",
  },
};

const CV_CERTIFICATION_ORDER = [
  'Microsoft Azure AI Essentials: Workloads and Machine Learning on Azure',
  'ReactJS for Beginners',
  'TypeScript Basics',
  'Getting Started with NodeJS',
  'Univators Skilling Future Digital Innovators - Cloud Engineering',
  'Network Defense',
  'Network Support and Security',
  'Introduction to Cybersecurity',
  'Networking Basics',
  'Network Addressing and Basic Troubleshooting',
  'Networking Devices and Initial Configuration',
  'Negotiation Mastery',
] as const;

const CV_LANGUAGES: NonNullable<CVData['languages']> = [
  { language: 'Greek', proficiency: 'Native' },
  { language: 'English', proficiency: 'Intermediate (B1-B2)' },
];

// Only basic contact info that doesn't change
function getPersonalInfo() {
  return {
    name: "Christos Kerigkas",
    title: "Full Stack Web Developer",
    email: "xrhstok59@gmail.com",
    phone: "+30 6982031371",
    location: "Halkidiki, Greece",
    website: "https://christoskerigkas.com",
    bio: "Full-stack web developer focused on Next.js, TypeScript, Supabase, and practical product development across web and mobile experiences.",
    profileImage: getProfileImageUrl(),
    socialLinks: {
      linkedin: "https://linkedin.com/in/christoskerigkas",
      github: "https://github.com/xrhstok59",
      credly: "https://www.credly.com/users/christos-kerigkas.cf8c18e5/badges",
    }
  };
}

// Convert projects from database schema to Project type
function mapProjectsFromDb(projects: DbProject[]): Project[] {
  return projects.map(project => ({
    title: project.title,
    slug: project.slug,
    description: project.short_description || project.description,
    categories: (project.categories ?? []) as ProjectCategory[],
    tech: project.tech ?? [],
    github: project.github,
    demo: project.live_url === null ? undefined : project.live_url,
    image: project.image,
    featured: project.featured,
    status: (project.status || 'Active') as ProjectStatus
  }));
}

function getCuratedCVProjects(projects: Project[]): Project[] {
  const projectMap = new Map(projects.map(project => [project.slug, project]));

  return CV_PROJECT_ORDER
    .map(slug => {
      const project = projectMap.get(slug);

      if (!project) {
        return null;
      }

      return {
        ...project,
        ...CV_PROJECT_OVERRIDES[slug],
      };
    })
    .filter((project): project is Project => project !== null);
}

function getCuratedCVCertifications(certifications: Certification[]): Certification[] {
  const certificationMap = new Map(
    certifications.map(certification => [certification.title, certification])
  );

  return CV_CERTIFICATION_ORDER
    .map(title => certificationMap.get(title))
    .filter((certification): certification is Certification => certification !== undefined);
}

/**
 * Get all CV data from database
 * All data (projects, certifications, experience, education) are fetched from the database
 */
export async function getCVData(): Promise<CVData> {
  try {
    const projectsFromDb = await projectsRepository.findAll();
    const certificationsFromDb = await getCertifications();
    const experienceFromDb = await getExperience();
    const educationFromDb = await getEducation();
    const skillsFromDb = await getSkills();

    console.log(`[getCVData] Loaded ${certificationsFromDb.length} certifications from database`);
    console.log(`[getCVData] Loaded ${projectsFromDb.length} projects from database`);
    console.log(`[getCVData] Loaded ${experienceFromDb.length} experience entries from database`);
    console.log(`[getCVData] Loaded ${educationFromDb.length} education entries from database`);
    console.log(`[getCVData] Loaded ${skillsFromDb.length} skills from database`);

    return {
      personalInfo: getPersonalInfo(),
      experience: experienceFromDb,
      education: educationFromDb,
      skills: skillsFromDb,
      certifications: getCuratedCVCertifications(certificationsFromDb),
      projects: getCuratedCVProjects(mapProjectsFromDb(projectsFromDb)),
      languages: CV_LANGUAGES,
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
