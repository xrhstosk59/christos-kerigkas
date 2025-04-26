// src/lib/cv-data.ts
// Προσθήκη 'use server' directive για να εξασφαλίσουμε ότι αυτό το αρχείο τρέχει μόνο στον server
'use server';

import { projectsRepository } from './db/repositories/projects-repository';
import { certificationsRepository } from './db/repositories/certifications-repository';
import { CVData, Experience, Education, Skill } from '@/types/cv';
import { Project, ProjectCategory, ProjectStatus } from '@/types/projects';
import { Certification, CertificationType } from '@/types/certifications';
import { studentProjects } from './mock-projects';
import { studentCertifications } from './mock-certifications';

// Mock δεδομένα για την επαγγελματική εμπειρία - προσαρμοσμένα για φοιτητή
const mockExperience: Experience[] = [
  {
    id: "exp1",
    company: "Uni Web Projects",
    position: "Freelance Web Developer",
    startDate: "2023-06-01",
    endDate: null, // Τρέχουσα απασχόληση
    description: "Ανάπτυξη web εφαρμογών για μικρές επιχειρήσεις και ιδιώτες.",
    responsibilities: [
      "Σχεδιασμός και υλοποίηση responsive websites",
      "Ανάπτυξη custom WordPress themes",
      "Δημιουργία απλών e-commerce λύσεων"
    ],
    technologies: ["HTML", "CSS", "JavaScript", "React", "WordPress", "PHP"],
    achievements: [
      "Ολοκλήρωση 5+ projects για τοπικές επιχειρήσεις",
      "Θετικά feedback και επαναλαμβανόμενοι πελάτες"
    ],
    location: "Καβάλα/Χαλκιδική"
  },
  {
    id: "exp2",
    company: "DigitalLab DUTh",
    position: "Research Assistant (Μερική απασχόληση)",
    startDate: "2022-09-01",
    endDate: "2023-06-30",
    description: "Συμμετοχή σε ερευνητικό project του τμήματος Πληροφορικής.",
    responsibilities: [
      "Ανάπτυξη web-based εφαρμογών για ερευνητικούς σκοπούς",
      "Συλλογή και ανάλυση δεδομένων",
      "Συνεργασία με την ερευνητική ομάδα"
    ],
    technologies: ["React", "Node.js", "Express", "MongoDB", "Data Analysis"],
    location: "Καβάλα"
  },
  {
    id: "exp3",
    company: "Local Web Agency",
    position: "Web Development Intern",
    startDate: "2021-07-01",
    endDate: "2021-08-31",
    description: "Πρακτική άσκηση σε τοπική εταιρεία web development.",
    responsibilities: [
      "Υποστήριξη front-end development",
      "Δημιουργία και βελτιστοποίηση ιστοσελίδων",
      "Εκμάθηση επαγγελματικών εργαλείων και μεθοδολογιών"
    ],
    technologies: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap"],
    location: "Χαλκιδική"
  }
];

// Mock δεδομένα για την εκπαίδευση - προσαρμοσμένα στην πραγματική κατάσταση
const mockEducation: Education[] = [
    {
      id: "edu1",
      institution: "Δημοκρίτειο Πανεπιστήμιο Θράκης",
      degree: "Πτυχίο",
      field: "Πληροφορική",
      startDate: "2020-09-01",
      endDate: null, // Σε εξέλιξη
      description: "4ο έτος σπουδών με εξειδίκευση σε τεχνολογίες Web και ανάπτυξη εφαρμογών.",
      location: "Καβάλα",
      achievements: [
        "Υποτροφία αριστείας 2ου έτους",
        "Συμμετοχή σε φοιτητικό διαγωνισμό προγραμματισμού",
        "Ανάπτυξη εφαρμογής web στα πλαίσια εργασίας μαθήματος"
      ]
    },
    {
      id: "edu2",
      institution: "Γενικό Λύκειο Σημάντρων Χαλκιδικής",
      degree: "Απολυτήριο",
      field: "Θετικών Επιστημών",
      startDate: "2017-09-01",
      endDate: "2020-06-30",
      description: "Αποφοίτηση με άριστα.",
      location: "Σήμαντρα, Χαλκιδική",
      gpa: 19.2
    }
  ];

// Mock δεδομένα για τις δεξιότητες - προσαρμοσμένα για φοιτητή
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
  
  // Γλώσσες Προγραμματισμού
  { name: "Java", level: 70, category: "languages", yearsOfExperience: 3 },
  { name: "Python", level: 65, category: "languages", yearsOfExperience: 2 },
  { name: "C/C++", level: 60, category: "languages", yearsOfExperience: 3 },
  
  // Soft Skills
  { name: "Ομαδική Εργασία", level: 85, category: "soft-skills", yearsOfExperience: 4 },
  { name: "Επίλυση Προβλημάτων", level: 80, category: "soft-skills", yearsOfExperience: 4 },
  { name: "Διαχείριση Χρόνου", level: 75, category: "soft-skills", yearsOfExperience: 4 }
];

// Επιστρέφει τα δεδομένα CV χωρίς να προσπαθεί να τα λάβει από τη βάση
export async function getMockCVData(): Promise<CVData> {
  return {
    personalInfo: {
      name: "Χρήστος Κέριγκας",
      title: "Φοιτητής Πληροφορικής | Επίδοξος Full-Stack Web Developer",
      email: "contact@christoskerigkas.com",
      location: "Καβάλα (Σπουδές) / Χαλκιδική (Μόνιμη)",
      website: "https://christoskerigkas.com",
      bio: "Φοιτητής 4ου έτους στο τμήμα Πληροφορικής του Δημοκρίτειου Πανεπιστημίου Θράκης, με πάθος για την ανάπτυξη web εφαρμογών. Επιδιώκω να εξελιχθώ ως Full-Stack Developer, συνδυάζοντας τις γνώσεις από τις σπουδές μου με προσωπικά projects και εργασιακή εμπειρία.",
      profileImage: "/uploads/profile.jpg",
      socialLinks: {
        linkedin: "https://linkedin.com/in/christoskerigkas",
        github: "https://github.com/christoskerigkas",
      }
    },
    experience: mockExperience,
    education: mockEducation,
    skills: mockSkills,
    certifications: studentCertifications,
    projects: studentProjects,
    languages: [
      { language: "Ελληνικά", proficiency: "Μητρική γλώσσα" },
      { language: "Αγγλικά", proficiency: "Άριστα (C2)" }
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

// Συνάρτηση που συγκεντρώνει όλα τα δεδομένα του CV
export async function getCVData(): Promise<CVData> {
  try {
    // Προσπάθησε να πάρεις δεδομένα από τη βάση
    const projectsFromDb = await projectsRepository.findAll();
    const certificationsFromDb = await certificationsRepository.findAll();
    
    // Αν υπάρχουν δεδομένα στη βάση, χρησιμοποίησέ τα
    if (projectsFromDb.length > 0 || certificationsFromDb.length > 0) {
      // Μετατροπή των certifications που έρχονται από τη βάση
      const certifications: Certification[] = certificationsFromDb.map(cert => ({
        id: cert.id,
        title: cert.title,
        issuer: cert.issuer,
        issueDate: cert.issueDate instanceof Date ? cert.issueDate.toISOString() : String(cert.issueDate),
        expirationDate: cert.expirationDate === null ? undefined : 
          (cert.expirationDate instanceof Date ? cert.expirationDate.toISOString() : String(cert.expirationDate)),
        credentialId: cert.credentialId === null ? undefined : cert.credentialId,
        credentialUrl: cert.credentialUrl === null ? undefined : cert.credentialUrl,
        description: cert.description === null ? undefined : cert.description,
        skills: cert.skills === null ? undefined : cert.skills,
        type: cert.type as CertificationType,
        filename: cert.filename,
        featured: cert.featured === null ? undefined : cert.featured
      }));
      
      // Μετατροπή των projects που έρχονται από τη βάση
      const projects: Project[] = projectsFromDb.map(project => ({
        title: project.title,
        slug: project.slug,
        description: project.description,
        categories: project.categories.map(cat => cat as unknown as ProjectCategory),
        tech: project.tech,
        github: project.github,
        demo: project.demo === null ? undefined : project.demo,
        image: project.image,
        featured: project.featured === null ? undefined : project.featured,
        status: 'Active' as ProjectStatus
      }));
      
      // Βασικά δεδομένα CV
      const baseData = await getMockCVData();
      
      // Επιστροφή με τα δεδομένα από τη βάση
      return {
        ...baseData,
        certifications: certificationsFromDb.length > 0 ? certifications : studentCertifications,
        projects: projectsFromDb.length > 0 ? projects : studentProjects
      };
    } else {
      // Αν δεν υπάρχουν δεδομένα στη βάση, χρησιμοποίησε τα mock δεδομένα
      return getMockCVData();
    }
  } catch (error) {
    console.error("Error in getCVData:", error);
    // Σε περίπτωση σφάλματος, επιστρέφουμε τα mock data
    return getMockCVData();
  }
}