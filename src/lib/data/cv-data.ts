// src/lib/data/cv-data.ts
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { getExperience } from '../db/repositories/experience-repository';
import { getEducation } from '../db/repositories/education-repository';
import { getSkills } from '../db/repositories/skills-repository';
import { CVData, Experience, Skill } from '@/types/cv';
import { Project, ProjectCategory, ProjectStatus } from '@/types/projects';
import { Certification } from '@/types/certifications';
import type { Database } from '../db/database.types';
import { getProfileImageUrl } from '../utils/storage';
import { mergePortfolioProjects } from './project-copy';

type DbProject = Database['public']['Tables']['projects']['Row'];
type CVSkillDefinition = {
  name: string;
  category: Skill['category'];
  minimumLevel?: number;
};

const CV_PROJECT_ORDER = [
  'christos-kerigkas',
  'sqlatch',
  'warrior-vs-aliens',
  'car-station',
  'zoo',
  'travel-planner',
  'wait-less',
  'grade-calc',
  'bluewave-properties',
  'saas-dashboard-template',
  'quiz-master',
] as const;

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

const CV_SKILL_DEFINITIONS: CVSkillDefinition[] = [
  { name: 'TypeScript', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'JavaScript', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'React', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'Next.js', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'TailwindCSS', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'HTML5', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'CSS3', category: 'Languages & Frameworks', minimumLevel: 100 },
  { name: 'React Native', category: 'Languages & Frameworks', minimumLevel: 80 },
  { name: 'Java', category: 'Languages & Frameworks', minimumLevel: 80 },
  { name: 'JavaFX', category: 'Languages & Frameworks', minimumLevel: 80 },
  { name: 'PHP', category: 'Languages & Frameworks', minimumLevel: 60 },
  { name: 'Python', category: 'Languages & Frameworks', minimumLevel: 60 },
  { name: 'Node.js', category: 'Technologies & Tools', minimumLevel: 100 },
  { name: 'Supabase', category: 'Technologies & Tools', minimumLevel: 100 },
  { name: 'PostgreSQL', category: 'Technologies & Tools', minimumLevel: 100 },
  { name: 'Prisma', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'NextAuth.js', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'Firebase', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'Sentry', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'SQLite', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'MySQL', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'Recharts', category: 'Technologies & Tools', minimumLevel: 80 },
  { name: 'Blockly', category: 'Technologies & Tools', minimumLevel: 60 },
  { name: 'Git', category: 'Technologies & Tools', minimumLevel: 100 },
];

const CV_LANGUAGES: NonNullable<CVData['languages']> = [
  { language: 'Greek', proficiency: 'Native' },
  { language: 'English', proficiency: 'Intermediate (B1-B2)' },
];

const DEFAULT_EXPERIENCE: Experience[] = [
  {
    id: 'municipality-of-nea-propontida-internship',
    company: 'Municipality of Nea Propontida',
    position: 'Technical Support Intern',
    startDate: '2025-05-01',
    endDate: '2025-07-31',
    description:
      'Provided remote and on-site IT support across municipal offices, assisting with hardware, software, printers, networking, and routine website maintenance tasks.',
    location: 'Halkidiki, Greece',
    responsibilities: [
      'Resolved workstation, printer, and network-related issues across municipal offices.',
      'Performed hardware replacement, formatting, operating system installation, and software setup.',
      'Helped prepare network cables and support routine technical maintenance tasks.',
      'Assisted with basic WordPress website checks and general ICT support tasks.',
    ],
    technologies: ['Windows', 'WordPress', 'Networking', 'Hardware Support', 'Printer Support'],
    achievements: [],
  },
];

// Only basic contact info that doesn't change
function getPersonalInfo() {
  return {
    name: "Christos Kerigkas",
    title: "Web Developer",
    email: "xrhstosk59@gmail.com",
    phone: "+30 6982031371",
    location: "Halkidiki, Greece",
    website: "https://christoskerigkas.com",
    bio: "Computer Science student at Democritus University of Thrace, focused on responsive websites and web applications with TypeScript and JavaScript, with additional coursework in Java/JavaFX and AI-assisted workflows for faster iteration and cleanup.",
    profileImage: getProfileImageUrl(),
    socialLinks: {
      linkedin: "https://linkedin.com/in/christoskerigkas",
      github: "https://github.com/xrhstosk59",
      credly: "https://www.credly.com/users/christos-kerigkas.cf8c18e5/badges",
    }
  };
}

function normalizeExperienceEntries(experience: Experience[]): Experience[] {
  if (experience.length === 0) {
    return DEFAULT_EXPERIENCE;
  }

  return experience.map((entry) => {
    const companyText = `${entry.company} ${entry.position}`.toLowerCase();

    if (
      companyText.includes('nea propontida') ||
      companyText.includes('municipality') ||
      companyText.includes('δήμος')
    ) {
      return {
        ...entry,
        company: 'Municipality of Nea Propontida',
        position: 'Technical Support Intern',
        description:
          'Provided remote and on-site IT support across municipal offices, assisting with hardware, software, printers, networking, and routine website maintenance tasks.',
        location: entry.location || 'Halkidiki, Greece',
        responsibilities: [
          'Resolved workstation, printer, and network-related issues across municipal offices.',
          'Performed hardware replacement, formatting, operating system installation, and software setup.',
          'Helped prepare network cables and support routine technical maintenance tasks.',
          'Assisted with basic WordPress website checks and general ICT support tasks.',
        ],
        technologies:
          entry.technologies && entry.technologies.length > 0
            ? entry.technologies
            : ['Windows', 'WordPress', 'Networking', 'Hardware Support', 'Printer Support'],
        achievements: entry.achievements ?? [],
      };
    }

    return entry;
  });
}

// Convert projects from database schema to Project type
function mapProjectsFromDb(projects: DbProject[]): Project[] {
  return mergePortfolioProjects(projects).map(project => ({
    title: project.title,
    slug: project.slug,
    description: project.description,
    categories: (project.categories ?? []) as ProjectCategory[],
    tech: project.tech ?? [],
    github: project.github,
    demo: project.live_url === null ? undefined : project.live_url,
    image: project.image,
    featured: project.featured,
    id: project.id,
    status: (project.status || 'Active') as ProjectStatus
  }));
}

function getCuratedCVProjects(projects: Project[]): Project[] {
  const projectMap = new Map(projects.map(project => [project.slug, project]));
  const curatedProjects = CV_PROJECT_ORDER
    .map(slug => {
      const project = projectMap.get(slug);

      if (!project) {
        return null;
      }

      return {
        ...project,
      };
    })
    .filter((project): project is Project => project !== null);

  const curatedSlugs = new Set(curatedProjects.map(project => project.slug));
  const remainingProjects = projects.filter(project => !curatedSlugs.has(project.slug));

  return [...curatedProjects, ...remainingProjects];
}

function getCuratedCVCertifications(certifications: Certification[]): Certification[] {
  const certificationMap = new Map(
    certifications.map(certification => [certification.title, certification])
  );

  return CV_CERTIFICATION_ORDER
    .map(title => certificationMap.get(title))
    .filter((certification): certification is Certification => certification !== undefined);
}

function getCuratedCVSkills(skills: Skill[]): Skill[] {
  const skillMap = new Map(skills.map(skill => [skill.name, skill]));
  const curatedNames = new Set(CV_SKILL_DEFINITIONS.map(skill => skill.name));

  const curatedSkills = CV_SKILL_DEFINITIONS.map(({ name, category, minimumLevel }, index) => {
    const existingSkill = skillMap.get(name);

    if (existingSkill) {
      return {
        ...existingSkill,
        category,
        level: Math.max(existingSkill.level, minimumLevel ?? existingSkill.level),
        order: index + 1,
      };
    }

    return {
      name,
      category,
      level: minimumLevel ?? 60,
      order: index + 1,
    };
  });

  const extraSkills = skills
    .filter(skill => !curatedNames.has(skill.name))
    .sort((left, right) => {
      const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      if (left.level !== right.level) {
        return right.level - left.level;
      }

      return left.name.localeCompare(right.name);
    })
    .map((skill, index) => ({
      ...skill,
      order: CV_SKILL_DEFINITIONS.length + index + 1,
    }));

  return [...curatedSkills, ...extraSkills];
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
      experience: normalizeExperienceEntries(experienceFromDb),
      education: educationFromDb,
      skills: getCuratedCVSkills(skillsFromDb),
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
