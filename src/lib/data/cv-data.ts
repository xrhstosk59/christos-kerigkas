// src/lib/data/cv-data.ts
// Add 'use server' directive to ensure this file runs only on the server
'use server';

import { projectsRepository } from '../db/repositories/projects-repository';
import { getCertifications } from '../db/repositories/certifications-repository';
import { CVData, Experience, Education, Skill } from '@/types/cv';
import { Project, ProjectCategory, ProjectStatus } from '@/types/projects';
import { Certification } from '@/types/certifications';
import { studentProjects } from './mock-projects';
import { Project as DbProject } from '../db/schema';

// Δημιουργούμε ένα fallback array για όταν δεν υπάρχουν πιστοποιητικά
const fallbackCertifications: Certification[] = [
  {
    id: 'univators-cloud',
    title: 'Univators Skilling Future Digital Innovators - Cloud Engineering',
    issuer: 'Univators & Democritus University of Thrace',
    issueDate: '2024-11-08',
    credentialId: '24C014989',
    description: '24-hour course focused on delivering fundamental knowledge in Cloud Engineering',
    skills: ['Cloud Engineering'],
    type: 'course',
    filename: 'Certificate-of-Completion-24C014989-Univators-Skilling-Future-Digital-Innovators-CHRISTOS-KERIGKAS.pdf',
    featured: true
  },
  {
    id: 'intro-cybersecurity',
    title: 'Introduction to Cybersecurity',
    issuer: 'Cisco Networking Academy',
    issueDate: '2024-11-09',
    type: 'badge',
    skills: ['Cybersecurity'],
    filename: 'Introduction_to_Cybersecurity_Badge20241109-27-40xb2m.pdf'
  },
  {
    id: 'networking-basics',
    title: 'Networking Basics',
    issuer: 'Cisco Networking Academy',
    issueDate: '2023-11-19',
    type: 'badge',
    skills: ['Networking'],
    filename: 'Networking_Basics_Badge20240113-29-5ou4ck.pdf'
  }
];

// Mock data for professional experience - tailored for a student
const mockExperience: Experience[] = [
  {
    id: "exp1",
    company: "Uni Web Projects",
    position: "Freelance Web Developer",
    startDate: "2023-06-01",
    endDate: null, // Current employment
    description: "Development of web applications for small businesses and individuals.",
    responsibilities: [
      "Design and implementation of responsive websites",
      "Development of custom WordPress themes",
      "Creation of simple e-commerce solutions"
    ],
    technologies: ["HTML", "CSS", "JavaScript", "React", "WordPress", "PHP"],
    achievements: [
      "Completion of 5+ projects for local businesses",
      "Positive feedback and recurring clients"
    ],
    location: "Kavala/Chalkidiki"
  },
  {
    id: "exp2",
    company: "DigitalLab DUTh",
    position: "Research Assistant (Part-time)",
    startDate: "2022-09-01",
    endDate: "2023-06-30",
    description: "Participation in a research project of the Department of Computer Science.",
    responsibilities: [
      "Development of web-based applications for research purposes",
      "Data collection and analysis",
      "Collaboration with the research team"
    ],
    technologies: ["React", "Node.js", "Express", "MongoDB", "Data Analysis"],
    location: "Kavala"
  },
  {
    id: "exp3",
    company: "Local Web Agency",
    position: "Web Development Intern",
    startDate: "2021-07-01",
    endDate: "2021-08-31",
    description: "Internship at a local web development company.",
    responsibilities: [
      "Support for front-end development",
      "Creation and optimization of websites",
      "Learning professional tools and methodologies"
    ],
    technologies: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap"],
    location: "Chalkidiki"
  }
];

// Mock data for education - adapted to the actual situation
const mockEducation: Education[] = [
  {
    id: "edu1",
    institution: "Democritus University of Thrace",
    degree: "Bachelor's Degree",
    field: "Computer Science",
    startDate: "2020-09-01",
    endDate: null, // In progress
    description: "4th year of studies specializing in Web technologies and application development.",
    location: "Kavala",
    achievements: [
      "2nd year scholarship for excellence",
      "Participation in a student programming competition",
      "Development of a web application as part of a course project"
    ]
  },
  {
    id: "edu2",
    institution: "General High School of Simantron, Chalkidiki",
    degree: "High School Diploma",
    field: "Science Track",
    startDate: "2017-09-01",
    endDate: "2020-06-30",
    description: "Graduated with honors.",
    location: "Simantra, Chalkidiki",
    gpa: 19.2
  }
];

// Mock data for skills - tailored for a student
const mockSkills: Skill[] = [
  // Frontend
  { name: "HTML5", level: 90, category: "frontend", yearsOfExperience: 3 },
  { name: "CSS3", level: 85, category: "frontend", yearsOfExperience: 3 },
  { name: "JavaScript", level: 75, category: "frontend", yearsOfExperience: 3 },
  { name: "React", level: 70, category: "frontend", yearsOfExperience: 2 },
  { name: "Bootstrap", level: 80, category: "frontend", yearsOfExperience: 3 },
  { name: "Tailwind CSS", level: 65, category: "frontend", yearsOfExperience: 1 },
  
  // Backend
  { name: "Node.js", level: 60, category: "backend", yearsOfExperience: 2 },
  { name: "Express", level: 55, category: "backend", yearsOfExperience: 1 },
  { name: "PHP", level: 65, category: "backend", yearsOfExperience: 2 },
  
  // Database
  { name: "MySQL", level: 70, category: "database", yearsOfExperience: 2 },
  { name: "MongoDB", level: 60, category: "database", yearsOfExperience: 1 },
  
  // DevOps & Tools
  { name: "Git", level: 75, category: "tools", yearsOfExperience: 3 },
  { name: "VS Code", level: 90, category: "tools", yearsOfExperience: 3 },
  { name: "GitHub", level: 75, category: "tools", yearsOfExperience: 3 },
  
  // Frameworks & CMS
  { name: "WordPress", level: 80, category: "frameworks", yearsOfExperience: 2 },
  { name: "Next.js", level: 60, category: "frameworks", yearsOfExperience: 1 },
  
  // Programming Languages
  { name: "Java", level: 70, category: "languages", yearsOfExperience: 3 },
  { name: "Python", level: 65, category: "languages", yearsOfExperience: 2 },
  { name: "C/C++", level: 60, category: "languages", yearsOfExperience: 3 },
  
  // Soft Skills
  { name: "Teamwork", level: 85, category: "soft-skills", yearsOfExperience: 4 },
  { name: "Problem Solving", level: 80, category: "soft-skills", yearsOfExperience: 4 },
  { name: "Time Management", level: 75, category: "soft-skills", yearsOfExperience: 4 }
];

// Returns CV data without trying to retrieve from the database
export async function getMockCVData(): Promise<CVData> {
  return {
    personalInfo: {
      name: "Christos Kerigkas",
      title: "Computer Science Student | Aspiring Full-Stack Web Developer",
      email: "contact@christoskerigkas.com",
      location: "Kavala (Studies) / Chalkidiki (Permanent)",
      website: "https://christoskerigkas.com",
      bio: "4th-year student in the Computer Science department at Democritus University of Thrace, passionate about web application development. I aim to grow as a Full-Stack Developer, combining knowledge from my studies with personal projects and work experience.",
      profileImage: "/uploads/profile.jpg",
      socialLinks: {
        linkedin: "https://linkedin.com/in/christoskerigkas",
        github: "https://github.com/christoskerigkas",
      }
    },
    experience: mockExperience,
    education: mockEducation,
    skills: mockSkills,
    certifications: fallbackCertifications,
    projects: studentProjects,
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

// Μετατροπή των projects από το σχήμα της βάσης δεδομένων στον τύπο Project
function mapProjectsFromDb(projects: DbProject[]): Project[] {
  return projects.map(project => ({
    title: project.title,
    slug: project.slug,
    description: project.description,
    categories: project.categories.map((cat: unknown) => cat as ProjectCategory),
    tech: project.tech,
    github: project.github,
    demo: project.demo === null ? undefined : project.demo,
    image: project.image,
    featured: project.featured === null ? false : Boolean(project.featured),
    status: 'Active' as ProjectStatus
  }));
}

// Function that collects all CV data
export async function getCVData(): Promise<CVData> {
  try {
    // Try to get data from the database
    const projectsFromDb = await projectsRepository.findAll();
    // Χρησιμοποιούμε την έτοιμη συνάρτηση getCertifications() που ήδη κάνει τη σωστή μετατροπή
    const certificationsFromDb = await getCertifications();
    
    // Καταγραφή των αποτελεσμάτων για αποσφαλμάτωση
    console.log(`[getCVData] Found ${certificationsFromDb.length} certifications in database`);
    console.log(`[getCVData] Found ${projectsFromDb.length} projects in database`);
    
    // If there is data in the database, use it
    const hasProjectsInDb = projectsFromDb.length > 0;
    const hasCertificationsInDb = certificationsFromDb.length > 0;
    
    if (hasProjectsInDb || hasCertificationsInDb) {
      // Χρησιμοποιούμε απευθείας τα μετατραπέντα δεδομένα από τη getCertifications()
      const certifications = hasCertificationsInDb 
        ? certificationsFromDb
        : fallbackCertifications;
      
      // Convert projects coming from the database
      const projects = hasProjectsInDb
        ? mapProjectsFromDb(projectsFromDb)
        : studentProjects;
      
      // Basic CV data
      const baseData = await getMockCVData();
      
      // Return with data from the database
      return {
        ...baseData,
        certifications: certifications,
        projects: projects
      };
    } else {
      // If there is no data in the database, use mock data
      console.log('[getCVData] No data found in database, using mock data');
      return getMockCVData();
    }
  } catch (error) {
    console.error("Error in getCVData:", error);
    // In case of error, return mock data
    return getMockCVData();
  }
}