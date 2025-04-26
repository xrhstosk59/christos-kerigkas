// src/lib/pdf-generator.ts
import { CVData, ExportOptions } from '@/types/cv';
import { jsPDF } from 'jspdf';

// Βοηθητική συνάρτηση για προσθήκη κειμένου με αναδίπλωση
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

// Βοηθητική συνάρτηση για προσθήκη τίτλου ενότητας
const addSectionTitle = (
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  options: { isDark: boolean }
): number => {
  // Προσθήκη γραμμής
  doc.setDrawColor(options.isDark ? '#6366F1' : '#4F46E5');
  doc.setLineWidth(0.5);
  doc.line(x, y, x + 190, y);
  
  // Προσθήκη τίτλου
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(options.isDark ? '#6366F1' : '#4F46E5');
  doc.text(title, x, y + 6);
  
  // Επαναφορά χρωμάτων και γραμματοσειράς για το υπόλοιπο περιεχόμενο
  doc.setTextColor(options.isDark ? '#E5E7EB' : '#1F2937');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  return y + 12; // Επιστροφή της νέας συντεταγμένης y
};

// Συνάρτηση για προσθήκη της ενότητας προσωπικών πληροφοριών
const addPersonalInfo = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  const { personalInfo } = data;
  
  // Όνομα και τίτλος
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(options.isDark ? '#F9FAFB' : '#111827');
  doc.text(personalInfo.name, 10, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(options.isDark ? '#D1D5DB' : '#4B5563');
  doc.text(personalInfo.title, 10, startY + 7);
  
  // Στοιχεία επικοινωνίας
  doc.setFontSize(10);
  doc.setTextColor(options.isDark ? '#E5E7EB' : '#1F2937');
  
  let contactY = startY + 15;
  if (personalInfo.email) {
    doc.text(`Email: ${personalInfo.email}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.phone) {
    doc.text(`Τηλέφωνο: ${personalInfo.phone}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.location) {
    doc.text(`Τοποθεσία: ${personalInfo.location}`, 10, contactY);
    contactY += 5;
  }
  
  if (personalInfo.website) {
    doc.text(`Website: ${personalInfo.website}`, 10, contactY);
    contactY += 5;
  }
  
  // Κοινωνικά δίκτυα
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
  
  // Bio (εάν υπάρχει)
  if (personalInfo.bio) {
    contactY += 5;
    doc.setFontSize(11);
    return addWrappedText(doc, personalInfo.bio, 10, contactY, 190, 5);
  }
  
  return contactY + 10; // Επιστροφή της νέας συντεταγμένης y
};

// Συνάρτηση για προσθήκη της ενότητας επαγγελματικής εμπειρίας
const addExperience = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  // Χρησιμοποιούμε το options.isDark απευθείας για να αποφύγουμε το ESLint warning
  let currentY = addSectionTitle(doc, 'ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ', 10, startY, options);
  
  data.experience.forEach((exp) => {
    // Θέση και εταιρεία
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(exp.position, 10, currentY);
    
    // Ημερομηνίες στα δεξιά
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateText = `${new Date(exp.startDate).toLocaleDateString('el-GR', { year: 'numeric', month: 'short' })} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString('el-GR', { year: 'numeric', month: 'short' }) : 'Σήμερα'}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Εταιρεία και τοποθεσία
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}${exp.location ? `, ${exp.location}` : ''}`, 10, currentY);
    
    currentY += 7;
    
    // Περιγραφή
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, exp.description, 10, currentY, 190, 5);
    
    currentY += 5;
    
    // Αρμοδιότητες
    if (exp.responsibilities && exp.responsibilities.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Αρμοδιότητες:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      exp.responsibilities.forEach((resp) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, resp, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    // Τεχνολογίες
    if (exp.technologies && exp.technologies.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Τεχνολογίες:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      
      const techText = exp.technologies.join(', ');
      currentY += 5;
      currentY = addWrappedText(doc, techText, 10, currentY, 190, 5);
    }
    
    // Επιτεύγματα
    if (exp.achievements && exp.achievements.length > 0) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Επιτεύγματα:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      exp.achievements.forEach((achievement) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, achievement, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    currentY += 7; // Κενό μεταξύ εμπειριών
  });
  
  return currentY;
};

// Συνάρτηση για προσθήκη της ενότητας εκπαίδευσης
const addEducation = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'ΕΚΠΑΙΔΕΥΣΗ', 10, startY, options);
  
  data.education.forEach((edu) => {
    // Πτυχίο και πεδίο
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${edu.degree} ${edu.field}`, 10, currentY);
    
    // Ημερομηνίες στα δεξιά
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateText = `${new Date(edu.startDate).toLocaleDateString('el-GR', { year: 'numeric' })} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString('el-GR', { year: 'numeric' }) : 'Σήμερα'}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Ίδρυμα και τοποθεσία
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}${edu.location ? `, ${edu.location}` : ''}`, 10, currentY);
    
    currentY += 7;
    
    // Περιγραφή
    if (edu.description) {
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(doc, edu.description, 10, currentY, 190, 5);
      currentY += 3;
    }
    
    // GPA
    if (edu.gpa) {
      doc.text(`Βαθμός: ${edu.gpa.toFixed(1)}/10`, 10, currentY);
      currentY += 5;
    }
    
    // Επιτεύγματα
    if (edu.achievements && edu.achievements.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Επιτεύγματα:', 10, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 5;
      
      edu.achievements.forEach((achievement) => {
        doc.text('• ', 10, currentY);
        currentY = addWrappedText(doc, achievement, 14, currentY, 186, 5);
        currentY += 3;
      });
    }
    
    currentY += 7; // Κενό μεταξύ εκπαιδεύσεων
  });
  
  return currentY;
};

// Συνάρτηση για προσθήκη της ενότητας δεξιοτήτων
const addSkills = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'ΔΕΞΙΟΤΗΤΕΣ', 10, startY, options);
  
  // Ομαδοποίηση δεξιοτήτων ανά κατηγορία
  const skillsByCategory = data.skills.reduce<Record<string, typeof data.skills>>((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});
  
  // Μετατροπή των κατηγοριών σε πιο φιλικά ονόματα
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
  
  // Προσθήκη των δεξιοτήτων ανά κατηγορία
  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    const categoryName = categoryNames[category] || category;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(categoryName, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    currentY += 5;
    
    // Προσθήκη των δεξιοτήτων της κατηγορίας
    const skillsText = skills
      .sort((a, b) => b.level - a.level)
      .map(skill => `${skill.name}${skill.yearsOfExperience ? ` (${skill.yearsOfExperience} έτη)` : ''}`)
      .join(', ');
    
    currentY = addWrappedText(doc, skillsText, 10, currentY, 190, 5);
    currentY += 7;
  });
  
  // Προσθήκη γλωσσών
  if (data.languages && data.languages.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Γλώσσες', 10, currentY);
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

// Συνάρτηση για προσθήκη της ενότητας πιστοποιήσεων
const addCertifications = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'ΠΙΣΤΟΠΟΙΗΣΕΙΣ', 10, startY, options);
  
  data.certifications.forEach((cert) => {
    doc.setFont('helvetica', 'bold');
    doc.text(cert.title, 10, currentY);
    
    // Ημερομηνία έκδοσης
    const issueDate = new Date(cert.issueDate);
    doc.setFont('helvetica', 'normal');
    const dateText = issueDate.toLocaleDateString('el-GR', { year: 'numeric', month: 'short' });
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, 200 - dateWidth, currentY);
    
    currentY += 5;
    
    // Εκδότης
    doc.setFont('helvetica', 'italic');
    doc.text(cert.issuer, 10, currentY);
    
    currentY += 5;
    
    // ID πιστοποίησης
    if (cert.credentialId) {
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${cert.credentialId}`, 10, currentY);
      currentY += 5;
    }
    
    // Περιγραφή
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
    
    currentY += 7; // Κενό μεταξύ πιστοποιήσεων
  });
  
  return currentY;
};

// Συνάρτηση για προσθήκη της ενότητας projects
const addProjects = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  let currentY = addSectionTitle(doc, 'ΕΡΓΑ', 10, startY, options);
  
  data.projects.forEach((project) => {
    doc.setFont('helvetica', 'bold');
    doc.text(project.title, 10, currentY);
    
    currentY += 5;
    
    // Περιγραφή
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, project.description, 10, currentY, 190, 5);
    
    currentY += 3;
    
    // Τεχνολογίες
    if (project.tech && project.tech.length > 0) {
      const techText = `Τεχνολογίες: ${project.tech.join(', ')}`;
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
    
    currentY += 7; // Κενό μεταξύ projects
  });
  
  return currentY;
};

// Συνάρτηση για προσθήκη της ενότητας ενδιαφερόντων
const addInterests = (
  doc: jsPDF,
  data: CVData,
  startY: number,
  options: { isDark: boolean }
): number => {
  if (!data.interests || data.interests.length === 0) {
    return startY;
  }
  
  let currentY = addSectionTitle(doc, 'ΕΝΔΙΑΦΕΡΟΝΤΑ', 10, startY, options);
  
  const interestsText = data.interests.join(', ');
  currentY = addWrappedText(doc, interestsText, 10, currentY, 190, 5);
  
  return currentY + 7;
};

// Κύρια συνάρτηση για τη δημιουργία του PDF
export const generateCV = (data: CVData, options: ExportOptions): jsPDF => {
  const isDark = options.colorScheme === 'dark';
  
  // Δημιουργία του PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Ρύθμιση του background color ανάλογα με το colorScheme
  if (isDark) {
    doc.setFillColor('#111827');
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor('#F9FAFB');
  } else {
    doc.setTextColor('#1F2937');
  }
  
  let currentY = 10; // Αρχική συντεταγμένη Y
  
  // Προσθήκη των ενοτήτων ανάλογα με τις επιλογές του χρήστη
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
  
  // Προσθήκη ενδιαφερόντων (αν υπάρχουν)
  if (data.interests && data.interests.length > 0) {
    // Αποφεύγουμε να αποθηκεύσουμε το αποτέλεσμα στo currentY
    // για να μην έχουμε το ESLint warning
    addInterests(doc, data, currentY, { isDark });
  }
  
  return doc;
};

// Συνάρτηση για τη δημιουργία και το download του PDF
export const downloadCV = async (data: CVData, options: ExportOptions, filename: string = 'cv.pdf'): Promise<void> => {
  const doc = generateCV(data, options);
  doc.save(filename);
};