// src/lib/mock-certifications.ts
import { Certification } from '@/types/certifications';

// Mock πιστοποιήσεις που θα μπορούσε να έχει ένας φοιτητής πληροφορικής
export const studentCertifications: Certification[] = [
  {
    id: "cert-1",
    title: "Web Development Bootcamp",
    issuer: "Udemy",
    issueDate: "2022-08-15",
    credentialId: "UC-12345678",
    credentialUrl: "https://www.udemy.com/certificate/UC-12345678/",
    description: "Ολοκληρωμένο bootcamp web development που καλύπτει HTML, CSS, JavaScript, Node.js, Express, MongoDB και React.",
    skills: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "MongoDB", "React"],
    type: "course",
    filename: "web-dev-bootcamp.pdf",
    featured: true
  },
  {
    id: "cert-2",
    title: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    issueDate: "2023-01-29",
    credentialId: "1234567890",
    credentialUrl: "https://www.credly.com/badges/1234567890",
    description: "Βασικές αρχές κυβερνοασφάλειας, απειλές, επιθέσεις και τεχνικές προστασίας δικτύων και πληροφοριακών συστημάτων.",
    skills: ["Cybersecurity", "Network Security", "Risk Management"],
    type: "badge",
    filename: "Introduction_to_Cybersecurity_Badge20241109-27-40xb2.pdf",
    featured: true
  },
  {
    id: "cert-3",
    title: "Networking Basics",
    issuer: "Cisco Networking Academy",
    issueDate: "2022-01-13",
    credentialId: "0987654321",
    credentialUrl: "https://www.credly.com/badges/0987654321",
    description: "Βασικές αρχές δικτύωσης, πρωτόκολλα και μοντέλα αναφοράς, διευθυνσιοδότηση IP και διαμόρφωση δικτυακών συσκευών.",
    skills: ["Networking", "TCP/IP", "IP Addressing", "Network Protocols"],
    type: "badge",
    filename: "Networking_Basics_Badge20240113-29-5ou4ck.pdf"
  },
  {
    id: "cert-4",
    title: "Data Structures & Algorithms in Java",
    issuer: "Coursera - University of California San Diego",
    issueDate: "2021-11-10",
    credentialId: "ABCD1234",
    credentialUrl: "https://www.coursera.org/verify/ABCD1234",
    description: "Εισαγωγή στις δομές δεδομένων και αλγορίθμους με εφαρμογές σε Java. Περιλαμβάνει λίστες, δέντρα, γραφήματα, ταξινόμηση και αναζήτηση.",
    skills: ["Java", "Data Structures", "Algorithms", "Problem Solving"],
    type: "course",
    filename: "ds-algorithms-certificate.pdf"
  },
  {
    id: "cert-5",
    title: "Συμμετοχή στο 15ο Συνέδριο Νέων Τεχνολογιών",
    issuer: "Δημοκρίτειο Πανεπιστήμιο Θράκης",
    issueDate: "2023-04-15",
    description: "Βεβαίωση συμμετοχής στο 15ο Συνέδριο Νέων Τεχνολογιών που διοργανώθηκε από το Δημοκρίτειο Πανεπιστήμιο Θράκης.",
    type: "conference",
    filename: "LTLO-15-Certificate-of-Participation.pdf"
  },
  {
    id: "cert-6",
    title: "React - The Complete Guide",
    issuer: "Udemy",
    issueDate: "2022-06-20",
    credentialId: "UC-87654321",
    credentialUrl: "https://www.udemy.com/certificate/UC-87654321/",
    description: "Ολοκληρωμένος οδηγός για την ανάπτυξη εφαρμογών με React.js, συμπεριλαμβανομένων Hooks, Redux, Router και άλλων προηγμένων θεμάτων.",
    skills: ["React", "Redux", "React Router", "React Hooks", "JavaScript", "SPA"],
    type: "course",
    filename: "react-complete-guide.pdf"
  },
  {
    id: "cert-7",
    title: "Network Support and Security",
    issuer: "Cisco Networking Academy",
    issueDate: "2022-03-15",
    credentialId: "ABCDEF123456",
    credentialUrl: "https://www.credly.com/badges/ABCDEF123456",
    description: "Πιστοποίηση στην υποστήριξη δικτύων και ασφάλεια. Περιλαμβάνει διαχείριση δικτυακού εξοπλισμού, αντιμετώπιση προβλημάτων και εφαρμογή πολιτικών ασφαλείας.",
    skills: ["Network Security", "Firewall Configuration", "Security Policies", "Troubleshooting"],
    type: "badge",
    filename: "Network_Support_and_Security_Badge20240113-29-1n54sk.pdf"
  },
  {
    id: "cert-8",
    title: "Σεμινάριο UI/UX Design για προγραμματιστές",
    issuer: "SkillUp",
    issueDate: "2023-07-05",
    credentialId: "SKILL-UX-2023-4567",
    credentialUrl: "https://skillup.com/verify/SKILL-UX-2023-4567",
    description: "Σεμινάριο σχεδιασμού διεπαφών χρήστη και εμπειρίας χρήστη για προγραμματιστές. Εστίαση στη δημιουργία εύχρηστων και ελκυστικών web interfaces.",
    skills: ["UI Design", "UX Design", "Wireframing", "Prototyping", "User Research"],
    type: "seminar",
    filename: "Βεβαίωση Παρακολούθησης - Κέριγκας  - Χρήστος .pdf",
    featured: true
  }
];