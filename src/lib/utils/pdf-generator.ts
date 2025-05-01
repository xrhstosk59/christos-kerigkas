// src/lib/pdf-generator.ts
import { CVData, ExportOptions } from '@/types/cv';
import { jsPDF } from 'jspdf';

// Helper function for adding wrapped text
const addWrappedText = (
  doc: jsPDF, 
  text: string, 
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number => {
  const textLines = doc.splitTextToSize(text, maxWidth);
  doc.text(textLines, x, y);
  return y + (textLines.length * lineHeight);
};

// Helper function for adding section title
const addSectionTitle = (
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  options: { isDark: boolean }
): number => {
  const { isDark } = options;
  
  // Add line
  doc.setDrawColor(isDark ? '#6366F1' : '#4F46E5');
  doc.setLineWidth(0.5);
  doc.line(x, y, x + 190, y);
  
  // Add title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(isDark ? '#6366F1' : '#4F46E5');
  doc.text(title, x, y + 6);
  
  // Reset colors and font for the rest of the content
  doc.setTextColor(isDark ? '#E5E7EB' : '#1F2937');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  return y + 12; // Return the new y coordinate
};

// Function to add personal information section
const addPersonalInfo = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  const { isDark } = options;
  const { personalInfo } = data;
  
  // Name and title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(isDark ? '#F9FAFB' : '#111827');
  doc.text(personalInfo.name, 10, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(isDark ? '#D1D5DB' : '#4B5563');
  doc.text(personalInfo.title, 10, startY + 7);
  
  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(isDark ? '#E5E7EB' : '#1F2937');
  
  let contactY = startY + 15;
  if (personalInfo.email) {
    doc.text(`Email: ${personalInfo.email}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.phone) {
    doc.text(`Phone: ${personalInfo.phone}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.location) {
    doc.text(`Location: ${personalInfo.location}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.website) {
    doc.text(`Website: ${personalInfo.website}`, 10, contactY);
    contactY += 5;
  }
  
  // Social links
  if (personalInfo.socialLinks) {
    if (personalInfo.socialLinks.linkedin) {
      doc.text(`LinkedIn: ${personalInfo.socialLinks.linkedin}`, 10, contactY);
      contactY += 5;
    }
    
    if (personalInfo.socialLinks.github) {
      doc.text(`GitHub: ${personalInfo.socialLinks.github}`, 10, contactY);
      contactY += 5;
    }
  }
  
  // Bio (if available)
  if (personalInfo.bio) {
    contactY += 5;
    doc.setFontSize(11);
    return addWrappedText(doc, personalInfo.bio, 10, contactY, 190, 5);
  }
  
  return contactY + 10; // Return the new y coordinate
};

// Function to add professional experience section
const addExperience = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'PROFESSIONAL EXPERIENCE', 10, startY, options);
  
  data.experience.forEach((exp) => {
    // Position and company
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(exp.position, 10, currentY);
    
    // Dates on the right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateText = `${new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Company and location
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}${exp.location ? `, ${exp.location}` : ''}`, 10, currentY);
    
    currentY += 7;
    
    // Description
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, exp.description, 10, currentY, 190, 5);
    
    currentY += 5;
    
    // Responsibilities
    if (exp.responsibilities && exp.responsibilities.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Responsibilities:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      exp.responsibilities.forEach((resp) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, resp, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    // Technologies
    if (exp.technologies && exp.technologies.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Technologies:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      
      const techText = exp.technologies.join(', ');
      currentY += 5;
      currentY = addWrappedText(doc, techText, 10, currentY, 190, 5);
    }
    
    // Achievements
    if (exp.achievements && exp.achievements.length > 0) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Achievements:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      exp.achievements.forEach((achievement) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, achievement, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    currentY += 7; // Space between experiences
  });
  
  return currentY;
};

// Function to add education section
const addEducation = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'EDUCATION', 10, startY, options);
  
  data.education.forEach((edu) => {
    // Degree and field
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${edu.degree} ${edu.field}`, 10, currentY);
    
    // Dates on the right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateText = `${new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric' }) : 'Present'}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Institution and location
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}${edu.location ? `, ${edu.location}` : ''}`, 10, currentY);
    
    currentY += 7;
    
    // Description
    if (edu.description) {
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(doc, edu.description, 10, currentY, 190, 5);
      currentY += 3;
    }
    
    // GPA
    if (edu.gpa) {
      doc.text(`GPA: ${edu.gpa.toFixed(1)}/20`, 10, currentY);
      currentY += 5;
    }
    
    // Achievements
    if (edu.achievements && edu.achievements.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Achievements:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      edu.achievements.forEach((achievement) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, achievement, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    currentY += 7; // Space between educations
  });
  
  return currentY;
};

// Function to add skills section
const addSkills = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'SKILLS', 10, startY, options);
  
  // Group skills by category
  const skillsByCategory = data.skills.reduce<Record<string, typeof data.skills>>((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof data.skills>);
  
  // Convert categories to more friendly names
  const categoryNames: Record<string, string> = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'database': 'Databases',
    'devops': 'DevOps',
    'mobile': 'Mobile',
    'design': 'Design',
    'languages': 'Languages',
    'frameworks': 'Frameworks',
    'tools': 'Tools',
    'soft-skills': 'Soft Skills',
    'other': 'Other'
  };
  
  // Add skills by category
  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    const categoryName = categoryNames[category] || category;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(categoryName, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    currentY += 5;
    
    // Add category skills
    const skillsText = skills
      .sort((a, b) => b.level - a.level)
      .map(skill => `${skill.name}${skill.yearsOfExperience ? ` (${skill.yearsOfExperience} years)` : ''}`)
      .join(', ');
    
    currentY = addWrappedText(doc, skillsText, 10, currentY, 190, 5);
    currentY += 7;
  });
  
  // Add languages
  if (data.languages && data.languages.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Languages', 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    currentY += 5;
    
    const languagesText = data.languages
      .map(lang => `${lang.language} (${lang.proficiency})`)
      .join(', ');
    
    currentY = addWrappedText(doc, languagesText, 10, currentY, 190, 5);
    currentY += 7;
  }
  
  return currentY;
};

// Function to add certifications section
const addCertifications = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'CERTIFICATIONS', 10, startY, options);
  
  data.certifications.forEach((cert) => {
    doc.setFont('helvetica', 'bold');
    doc.text(cert.title, 10, currentY);
    
    // Issue date
    const issueDate = new Date(cert.issueDate);
    doc.setFont('helvetica', 'normal');
    const dateText = issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Issuer
    doc.setFont('helvetica', 'italic');
    doc.text(cert.issuer, 10, currentY);
    
    currentY += 5;
    
    // Credential ID
    if (cert.credentialId) {
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${cert.credentialId}`, 10, currentY);
      currentY += 5;
    }
    
    // Description
    if (cert.description) {
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(doc, cert.description, 10, currentY, 190, 5);
    }
    
    // Skills
    if (cert.skills && cert.skills.length > 0) {
      currentY += 3;
      const skillsText = cert.skills.join(', ');
      doc.setFontSize(9);
      currentY = addWrappedText(doc, `Skills: ${skillsText}`, 10, currentY, 190, 4);
      doc.setFontSize(10);
    }
    
    currentY += 7; // Space between certifications
  });
  
  return currentY;
};

// Function to add projects section
const addProjects = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'PROJECTS', 10, startY, options);
  
  data.projects.forEach((project) => {
    doc.setFont('helvetica', 'bold');
    doc.text(project.title, 10, currentY);
    
    currentY += 5;
    
    // Description
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, project.description, 10, currentY, 190, 5);
    
    currentY += 3;
    
    // Technologies
    if (project.tech && project.tech.length > 0) {
      const techText = `Technologies: ${project.tech.join(', ')}`;
      doc.setFontSize(9);
      currentY = addWrappedText(doc, techText, 10, currentY, 190, 4);
      doc.setFontSize(10);
    }
    
    // Links
    currentY += 3;
    doc.text(`GitHub: ${project.github}`, 10, currentY);
    
    if (project.demo) {
      currentY += 4;
      doc.text(`Demo: ${project.demo}`, 10, currentY);
    }
    
    currentY += 7; // Space between projects
  });
  
  return currentY;
};

// Function to add interests section
const addInterests = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  if (!data.interests || data.interests.length === 0) {
    return startY;
  }
  
  let currentY = addSectionTitle(doc, 'INTERESTS', 10, startY, options);
  
  const interestsText = data.interests.join(', ');
  currentY = addWrappedText(doc, interestsText, 10, currentY, 190, 5);
  
  return currentY + 7;
};

// Main function for creating the PDF
export const generateCV = (data: CVData, options: ExportOptions): jsPDF => {
  const isDark = options.colorScheme === 'dark';
  
  // Create PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set background color based on colorScheme
  if (isDark) {
    doc.setFillColor('#111827');
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor('#F9FAFB');
  } else {
    doc.setTextColor('#1F2937');
  }
  
  let currentY = 10; // Initial Y coordinate
  
  // Add sections based on user options
  if (options.includePersonalInfo) {
    currentY = addPersonalInfo(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  if (options.includeExperience) {
    currentY = addExperience(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  if (options.includeEducation) {
    currentY = addEducation(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  if (options.includeSkills) {
    currentY = addSkills(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  if (options.includeCertifications) {
    currentY = addCertifications(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  if (options.includeProjects) {
    currentY = addProjects(doc, data, currentY, { isDark });
    currentY += 10;
  }
  
  // Add interests (if available)
  addInterests(doc, data, currentY, { isDark });
  
  return doc;
};

// Function for creating and downloading the PDF
export const downloadCV = async (data: CVData, options: ExportOptions, filename: string = 'cv.pdf'): Promise<void> => {
  const doc = generateCV(data, options);
  doc.save(filename);
};