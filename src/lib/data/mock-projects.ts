// src/lib/data/mock-projects.ts
import { Project, CryptoProject } from '@/types/projects';
import { Bitcoin, LineChart, Network, Code, RefreshCw } from 'lucide-react';

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

// Mock projects για crypto & trading
export const filteredCryptoProjects: CryptoProject[] = [
  {
    title: "Crypto Trading Bot",
    slug: "crypto-trading-bot",
    description: "Αυτοματοποιημένο σύστημα συναλλαγών κρυπτονομισμάτων που χρησιμοποιεί αλγόριθμους ML για να εντοπίζει και να εκτελεί συναλλαγές με βάση παραμέτρους που ορίζονται από τον χρήστη.",
    tech: ["Python", "TensorFlow", "Binance API", "Docker", "MongoDB"],
    features: [
      "Ανάλυση τεχνικών δεικτών σε πραγματικό χρόνο",
      "Backtesting με ιστορικά δεδομένα",
      "Αυτόματη εκτέλεση συναλλαγών",
      "Διαχείριση κινδύνου και ρυθμιζόμενα stop-loss",
      "Web dashboard για παρακολούθηση απόδοσης"
    ],
    github: "https://github.com/christoskerigkas/crypto-trading-bot",
    status: "Active",
    icon: Bitcoin
  },
  {
    title: "Market Sentiment Analyzer",
    slug: "market-sentiment-analyzer",
    description: "Εργαλείο ανάλυσης κοινωνικών μέσων που παρακολουθεί το Twitter, Reddit και άλλες πλατφόρμες για να μετρήσει το συναίσθημα της αγοράς σχετικά με συγκεκριμένα κρυπτονομίσματα.",
    tech: ["Python", "NLTK", "Twitter API", "React", "FastAPI"],
    features: [
      "Ανάλυση συναισθημάτων σε δημοσιεύσεις κοινωνικών μέσων",
      "Οπτικοποίηση τάσεων συναισθημάτων με την πάροδο του χρόνου",
      "Συσχέτιση συναισθημάτων με κινήσεις τιμών",
      "Προσαρμοσμένες ειδοποιήσεις για απότομες αλλαγές",
      "Εβδομαδιαίες αναφορές με βασικές πληροφορίες"
    ],
    github: "https://github.com/christoskerigkas/market-sentiment-analyzer",
    status: "Completed",
    icon: LineChart
  },
  {
    title: "DeFi Portfolio Manager",
    slug: "defi-portfolio-manager",
    description: "Web εφαρμογή για τη διαχείριση και παρακολούθηση επενδύσεων DeFi σε πολλαπλά blockchain. Συγκεντρώνει όλα τα assets, yields και liquidity pools σε ένα εύχρηστο dashboard.",
    tech: ["Next.js", "Ethers.js", "Web3.js", "TheGraph", "Tailwind CSS"],
    features: [
      "Παρακολούθηση αποδόσεων και φαρμαρισμάτων σε πολλαπλά πρωτόκολλα",
      "Ιστορικά δεδομένα και οπτικοποιήσεις απόδοσης",
      "Ειδοποιήσεις για σημαντικά γεγονότα, όπως λήξη κλειδώματος",
      "Αυτόματος υπολογισμός και βελτιστοποίηση APY",
      "Ενσωμάτωση με MetaMask και άλλα wallets"
    ],
    github: "https://github.com/christoskerigkas/defi-portfolio-manager",
    status: "In Development",
    icon: Network
  },
  {
    title: "Smart Contract Development Framework",
    slug: "smart-contract-development-framework",
    description: "Ολοκληρωμένο πλαίσιο ανάπτυξης, ελέγχου και εξάπλωσης έξυπνων συμβολαίων για Ethereum και συμβατά blockchains με έμφαση στην ασφάλεια και τη βελτιστοποίηση gas.",
    tech: ["Solidity", "Hardhat", "TypeScript", "Waffle", "Ethers.js"],
    features: [
      "Προκαθορισμένα μοτίβα για τύπους συμβολαίων (ERC20, ERC721, κ.λπ.)",
      "Αυτοματοποιημένες δοκιμές ασφάλειας και auditing",
      "Βελτιστοποίηση gas με προηγμένες τεχνικές",
      "Αυτοματοποιημένη ανάπτυξη σε testnet και mainnet",
      "Εκτενής τεκμηρίωση και παραδείγματα χρήσης"
    ],
    github: "https://github.com/christoskerigkas/smart-contract-framework",
    status: "Active",
    icon: Code
  },
  {
    title: "Arbitrage Scanner",
    slug: "arbitrage-scanner",
    description: "Σύστημα που εντοπίζει και εκμεταλλεύεται ευκαιρίες arbitrage μεταξύ διαφορετικών ανταλλακτηρίων κρυπτονομισμάτων σε πραγματικό χρόνο, εστιάζοντας στην ταχύτητα εκτέλεσης και την ελαχιστοποίηση του κινδύνου.",
    tech: ["Rust", "WebSocket APIs", "PostgreSQL", "Redis", "Docker"],
    features: [
      "Παρακολούθηση 20+ ανταλλακτηρίων για διαφορές τιμών",
      "Υπολογισμός κόστους συναλλαγών και κέρδους σε πραγματικό χρόνο",
      "Αυτόματη εκτέλεση συναλλαγών όταν πληρούνται προκαθορισμένα κριτήρια",
      "Εξελιγμένοι αλγόριθμοι δρομολόγησης για βέλτιστη εκτέλεση",
      "Λεπτομερής καταγραφή και αναφορές απόδοσης"
    ],
    github: "https://github.com/christoskerigkas/arbitrage-scanner",
    status: "Completed",
    icon: RefreshCw
  }
];