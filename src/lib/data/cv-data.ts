// src/lib/data/cv-data.ts
// Add 'use server' directive to ensure this file runs only on the server
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { CVData, Skill, Experience, Education } from '@/types/cv';
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

// Skills data based on technologies learned
function getSkills(): Skill[] {
  return [
    // Frontend
    { name: "React", level: 85, category: "frontend", yearsOfExperience: 2, description: "Building modern web applications with React and hooks" },
    { name: "Next.js", level: 80, category: "frontend", yearsOfExperience: 1.5, description: "Full-stack development with Next.js App Router" },
    { name: "TypeScript", level: 80, category: "frontend", yearsOfExperience: 2, description: "Type-safe development with TypeScript" },
    { name: "JavaScript", level: 90, category: "languages", yearsOfExperience: 3, description: "Modern ES6+ JavaScript development" },
    { name: "HTML/CSS", level: 90, category: "frontend", yearsOfExperience: 3, description: "Semantic HTML and modern CSS" },
    { name: "Tailwind CSS", level: 85, category: "frontend", yearsOfExperience: 2, description: "Utility-first CSS framework" },

    // Backend
    { name: "Node.js", level: 75, category: "backend", yearsOfExperience: 2, description: "Backend development with Node.js" },
    { name: "Python", level: 70, category: "languages", yearsOfExperience: 2, description: "Python for backend and data analysis" },
    { name: "Java", level: 65, category: "languages", yearsOfExperience: 1.5, description: "Object-oriented programming with Java" },

    // Database
    { name: "PostgreSQL", level: 70, category: "database", yearsOfExperience: 1, description: "Relational database management" },
    { name: "Supabase", level: 75, category: "backend", yearsOfExperience: 1, description: "Backend-as-a-Service with Supabase" },
    { name: "Oracle Database", level: 65, category: "database", yearsOfExperience: 1, description: "Enterprise database management" },

    // DevOps & Tools
    { name: "Git", level: 80, category: "tools", yearsOfExperience: 3, description: "Version control with Git" },
    { name: "Docker", level: 60, category: "devops", yearsOfExperience: 1, description: "Container management and deployment" },
    { name: "Vercel", level: 75, category: "devops", yearsOfExperience: 1.5, description: "Deployment and hosting" },

    // Other
    { name: "REST APIs", level: 75, category: "backend", yearsOfExperience: 2, description: "RESTful API design and development" },
    { name: "Responsive Design", level: 85, category: "frontend", yearsOfExperience: 2, description: "Mobile-first responsive web design" },
  ];
}

// Experience data (internships and work)
function getExperience(): Experience[] {
  return [
    {
      id: "intern-1",
      company: "Seaside Agency",
      position: "Full-Stack Web Developer Intern",
      startDate: "2024-07",
      endDate: null, // Current position
      description: "Working as a full-stack web developer intern, gaining hands-on experience with modern web technologies and real-world projects.",
      responsibilities: [
        "Developing and maintaining web applications using Next.js and React",
        "Building responsive user interfaces with Tailwind CSS",
        "Working with PostgreSQL and Supabase for database management",
        "Implementing RESTful APIs and backend logic",
        "Collaborating with the team on project planning and execution"
      ],
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase"],
      location: "Kavala, Greece",
    }
  ];
}

// Education data
function getEducation(): Education[] {
  return [
    {
      id: "edu-1",
      institution: "Democritus University of Thrace",
      degree: "Bachelor's Degree",
      field: "Computer Science",
      startDate: "2021-09",
      endDate: null, // Currently studying
      description: "4th-year student in the Computer Science department, focusing on web development, software engineering, and database systems.",
      location: "Kavala, Greece",
      achievements: [
        "Focus on web application development",
        "Studied software engineering principles",
        "Database systems and SQL",
        "Object-oriented programming",
        "Data structures and algorithms"
      ]
    }
  ];
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
      experience: getExperience(),
      education: getEducation(),
      skills: getSkills(),
      certifications: certificationsFromDb,
      projects: mapProjectsFromDb(projectsFromDb),
      languages: staticData.languages,
      interests: staticData.interests
    };
  } catch (error) {
    console.error("Error in getCVData:", error);
    // Return static data structure on error (without database data)
    const staticData = getStaticData();
    return {
      personalInfo: getPersonalInfo(),
      experience: getExperience(),
      education: getEducation(),
      skills: getSkills(),
      certifications: [], // Empty on error since it comes from database
      projects: [], // Empty on error since it comes from database
      languages: staticData.languages,
      interests: staticData.interests
    };
  }
}