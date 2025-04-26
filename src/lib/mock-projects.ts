// src/lib/mock-projects.ts
import { Project } from '@/types/projects';

// Mock projects που αντιπροσωπεύουν εργασίες/projects ενός φοιτητή πληροφορικής
export const studentProjects: Project[] = [
  {
    title: "University Course Manager",
    slug: "university-course-manager",
    description: "Εφαρμογή διαχείρισης μαθημάτων και υλικού σπουδών για φοιτητές. Αναπτύχθηκε ως μέρος εργασίας για το μάθημα 'Τεχνολογίες Web'. Επιτρέπει στους φοιτητές να οργανώνουν το πρόγραμμα σπουδών τους, να αποθηκεύουν σημειώσεις και να παρακολουθούν την πρόοδό τους.",
    categories: ["web-development", "education"],
    tech: ["React", "Node.js", "Express", "MongoDB", "Bootstrap"],
    github: "https://github.com/christoskerigkas/university-course-manager",
    demo: "https://ucm-demo.vercel.app",
    image: "/uploads/projects/ucm-preview.jpg",
    featured: true,
    status: "Completed"
  },
  {
    title: "Local Business Finder",
    slug: "local-business-finder",
    description: "Web εφαρμογή για την εύρεση τοπικών επιχειρήσεων στην περιοχή της Καβάλας. Χρησιμοποιεί το Google Maps API για την εμφάνιση των επιχειρήσεων στο χάρτη και επιτρέπει το φιλτράρισμα με βάση διάφορες κατηγορίες.",
    categories: ["web-development", "real-estate"],
    tech: ["JavaScript", "HTML", "CSS", "Google Maps API", "Firebase"],
    github: "https://github.com/christoskerigkas/local-business-finder",
    image: "/uploads/projects/lbf-preview.jpg",
    featured: true,
    status: "Active"
  },
  {
    title: "Weather Dashboard",
    slug: "weather-dashboard",
    description: "Μια διαδραστική εφαρμογή πρόγνωσης καιρού που χρησιμοποιεί το OpenWeatherMap API για να παρέχει τρέχουσες καιρικές συνθήκες και προβλέψεις 5 ημερών. Περιλαμβάνει αποθήκευση τοποθεσιών και γραφικές απεικονίσεις δεδομένων.",
    categories: ["web-development", "data-analysis"],
    tech: ["React", "Chart.js", "API Integration", "Tailwind CSS"],
    github: "https://github.com/christoskerigkas/weather-dashboard",
    demo: "https://weather.christoskerigkas.com",
    image: "/uploads/projects/weather-preview.jpg",
    status: "Completed"
  },
  {
    title: "E-commerce Platform",
    slug: "ecommerce-platform",
    description: "Μια πλήρης λύση ηλεκτρονικού εμπορίου με λειτουργίες καλαθιού αγορών, διαχείρισης προϊόντων, αναζήτησης και επεξεργασίας πληρωμών. Αναπτύχθηκε ως εργασία για το μάθημα 'Ηλεκτρονικό Επιχειρείν'.",
    categories: ["web-development"],
    tech: ["Next.js", "Stripe API", "MongoDB", "Tailwind CSS", "NextAuth.js"],
    github: "https://github.com/christoskerigkas/ecommerce-platform",
    image: "/uploads/projects/ecommerce-preview.jpg",
    status: "In Development"
  },
  {
    title: "Pet Care App",
    slug: "pet-care-app",
    description: "Εφαρμογή για κινητά που βοηθά τους ιδιοκτήτες κατοικίδιων να παρακολουθούν τις ανάγκες φροντίδας των ζώων τους, όπως εμβολιασμούς, ιατρικά ραντεβού, διατροφή και άσκηση. Περιλαμβάνει υπενθυμίσεις και ημερολόγιο δραστηριοτήτων.",
    categories: ["mobile", "animals"],
    tech: ["React Native", "Firebase", "Redux", "Expo"],
    github: "https://github.com/christoskerigkas/pet-care-app",
    image: "/uploads/projects/petcare-preview.jpg",
    status: "Active"
  },
  {
    title: "Personal Portfolio",
    slug: "personal-portfolio",
    description: "Ο προσωπικός μου ιστότοπος portfolio που παρουσιάζει τα έργα, τις δεξιότητες και την εμπειρία μου. Σχεδιασμένος με γνώμονα την ταχύτητα και τη βελτιστοποίηση SEO.",
    categories: ["web-development", "portfolio"],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/christoskerigkas/personal-website",
    demo: "https://christoskerigkas.com",
    image: "/uploads/projects/portfolio-preview.jpg",
    featured: true,
    status: "Active"
  }
];