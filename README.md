# Christos Kerigkas - Personal Portfolio

[![CI](https://github.com/xrhstosk59/christos-kerigkas/actions/workflows/ci.yml/badge.svg)](https://github.com/xrhstosk59/christos-kerigkas/actions/workflows/ci.yml)
[![Deploy](https://github.com/xrhstosk59/christos-kerigkas/actions/workflows/deploy.yml/badge.svg)](https://github.com/xrhstosk59/christos-kerigkas/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Ένα σύγχρονο, επαγγελματικό portfolio με enterprise-grade αρχιτεκτονική, κατασκευασμένο με Next.js 15, React 19, TypeScript και Tailwind CSS.

> **Tech Highlights**: Domain-driven architecture • Strict TypeScript • Comprehensive security headers • 2FA authentication • Audit logging • Real-time monitoring • CI/CD pipelines

## 🚀 Χαρακτηριστικά

- **Modern Stack**: Next.js 15, React 19, TypeScript και Tailwind CSS
- **Responsive Design**: Προσαρμόζεται σε όλες τις συσκευές (mobile, tablet, desktop)
- **Dark/Light Mode**: Πλήρης υποστήριξη σκοτεινού/φωτεινού θέματος
- **Διαδραστικό CV**:
  - Skills με επίπεδα γνώσης και χρόνια εμπειρίας
  - Experience section με λεπτομέρειες πρακτικής
  - Education section με σπουδές και επιτεύγματα
  - Certifications από τη βάση δεδομένων
  - Projects από τη βάση δεδομένων
  - Δυνατότητα εξαγωγής σε PDF με πολλαπλά templates
- **Admin Panel**: Ασφαλές διαχειριστικό για διαχείριση περιεχομένου
- **2FA Authentication**: Two-factor authentication με encrypted storage
- **Animated UI**: Εντυπωσιακά animations με Framer Motion
- **SEO Optimized**: Βελτιστοποιημένο για μηχανές αναζήτησης
- **Fast Performance**: Server-side rendering και βελτιστοποιημένα assets
- **Contact Form**: Με rate limiting και αποθήκευση στη βάση δεδομένων
- **Analytics**: Ενσωματωμένη υποστήριξη για Google Analytics
- **Error Tracking**: Sentry integration για monitoring και performance tracking
- **Security Features**: Encrypted 2FA, rate limiting, audit logging, hardened CSP

## 📋 Προαπαιτούμενα

- Node.js 20.x ή νεότερη έκδοση
- npm ή yarn package manager
- Λογαριασμός Supabase για τη βάση δεδομένων και authentication
- (Προαιρετικά) Λογαριασμός Vercel για deployment

## 🛠️ Εγκατάσταση

1. **Κλωνοποίηση του repository**

```bash
git clone https://github.com/xrhstosk59/christos-kerigkas.git
cd christos-kerigkas
```

2. **Εγκατάσταση εξαρτήσεων**

```bash
npm install
# ή
yarn install
```

3. **Ρύθμιση μεταβλητών περιβάλλοντος**

Δημιουργήστε ένα αρχείο `.env.local` στον ριζικό κατάλογο και προσθέστε τις απαραίτητες μεταβλητές περιβάλλοντος.

> 📖 **Για πλήρεις οδηγίες setup δες το [SETUP.md](./SETUP.md)**

Ελάχιστες απαιτούμενες μεταβλητές:

```env
# Database
DATABASE_URL=your_supabase_postgresql_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (για φόρμα επικοινωνίας)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_sender_email
CONTACT_EMAIL=your_contact_email

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# API
NEXT_PUBLIC_API_URL=your_api_url_or_domain
```

4. **Ρύθμιση της βάσης δεδομένων**

```bash
npm run db:push
npm run db:seed
```

5. **Εκτέλεση της εφαρμογής σε development mode**

```bash
npm run dev
# ή
yarn dev
```

## 🔒 Security Features

Το project ακολουθεί best practices για security:

- **Authentication**: Supabase Auth με 2FA support
- **Rate Limiting**: In-memory rate limiting για API protection
- **Security Headers**: CSP, HSTS, X-Frame-Options, και άλλα
- **Audit Logging**: Comprehensive logging για admin actions
- **Input Validation**: Zod schemas για validation
- **Error Boundaries**: Graceful error handling με reporting
- **SQL Injection Protection**: Parameterized queries με Drizzle ORM

## 🔄 CI/CD

Το project χρησιμοποιεί GitHub Actions για automated workflows:

### CI Pipeline
- **Code Quality**: Linting και type checking
- **Build Verification**: Build check για κάθε PR
- **Bundle Size**: Automatic bundle size monitoring
- **Dependency Check**: Automated unused dependency detection

### Deployment Pipeline
- **Automatic Deploy**: Auto-deploy στο Vercel για main branch
- **Preview Deployments**: Automatic preview για κάθε PR
- **Environment Management**: Secure secrets management

### Dependabot
- **Automated Updates**: Weekly dependency updates
- **Security Patches**: Automatic security vulnerability fixes
- **Version Grouping**: Smart grouping για patch updates

Για να ενεργοποιήσετε τα workflows, προσθέστε τα παρακάτω secrets στο GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## 🏗️ Δομή Project

```
christos-kerigkas/
├── public/                 # Στατικά assets και uploads
├── src/
│   ├── app/                # App router pages και API routes
│   ├── components/         # React components
│   │   ├── common/         # Επαναχρησιμοποιήσιμα components
│   │   ├── features/       # Components ανά λειτουργικότητα 
│   │   ├── layout/         # Components για το layout
│   │   ├── providers/      # Context providers
│   │   └── ui/             # UI components
│   ├── content/            # Στατικό περιεχόμενο (posts, projects)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities και helpers
│   │   ├── api/            # API clients 
│   │   ├── auth/           # Authentication logic
│   │   ├── data/           # Data fetching και mock data
│   │   ├── db/             # Database schema και repositories
│   │   ├── supabase/       # Supabase clients
│   │   └── utils/          # Utility functions
│   ├── middleware.ts       # Next.js middleware
│   └── types/              # TypeScript type definitions
├── drizzle/                # Drizzle migrations
├── supabase/               # Supabase configuration
├── .env.local              # Environment variables (local)
└── ...                     # Configuration files
```

## 🚀 Deployment

Το project είναι έτοιμο για deployment στο Vercel:

```bash
npm run build
# Έλεγχος του build τοπικά
npm run start

# Ή απευθείας deployment στο Vercel
vercel
```

### Χειροκίνητο Deployment

1. Κάντε build την εφαρμογή
```bash
npm run build
```

2. Ξεκινήστε τον production server
```bash
npm run start
```

## 📝 Scripts

### Development
- `npm run dev` - Εκτέλεση σε development mode με Turbopack
- `npm run build` - Δημιουργία production build
- `npm run start` - Εκτέλεση του production build
- `npm run lint` - Έλεγχος linting
- `npm run type-check` - TypeScript type checking

### Database
- `npm run db:generate` - Δημιουργία Drizzle migrations
- `npm run db:migrate` - Εκτέλεση database migrations
- `npm run db:push` - Push schema changes στη βάση
- `npm run db:studio` - Εκκίνηση του Drizzle Studio
- `npm run db:seed` - Εισαγωγή αρχικών δεδομένων
- `npm run db:health` - Database health check
- `npm run db:verify` - Verify database schema

### Performance & Analysis
- `npm run analyze` - Bundle analysis
- `npm run bundle-size` - Check bundle size limits
- `npm run performance` - Run performance checks
- `npm run deps:check` - Check for unused dependencies

### Maintenance
- `npm run clean` - Καθαρισμός build artifacts
- `npm run clean:install` - Καθαρισμός και reinstall dependencies

## 🧰 Τεχνολογίες

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **State Management**: React Context
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Email**: Nodemailer
- **Markdown**: React Markdown
- **PDF Generation**: jsPDF

## 👤 Admin Panel

Το admin panel είναι προσβάσιμο στη διαδρομή `/admin`.

### Features:
- **Content Management**: Διαχείριση projects και certifications
- **Communications**: Προβολή μηνυμάτων επικοινωνίας
- **User Management**: Διαχείριση χρηστών και permissions
- **Audit Logs**: Comprehensive audit trail για όλες τις actions
- **Performance Monitor**: Real-time performance metrics
- **Database Health**: Database health monitoring
- **Security**: Account lockouts και rate limiting status
- **2FA Setup**: Two-factor authentication configuration

## ⚡ Performance

Το project βελτιστοποιημένο για performance:

- **Bundle Size**: JavaScript bundles < 250KB (gzipped)
- **CSS**: Optimized CSS < 30KB (gzipped)
- **Image Optimization**: Automatic WebP/AVIF conversion
- **Code Splitting**: Automatic route-based code splitting
- **Server Components**: Extensive use για μειωμένο client JS
- **Middleware**: Optimized για minimal overhead
- **Caching**: In-memory caching για API responses

## 🤝 Contributing

Contributions are welcome! Αν θέλετε να συνεισφέρετε:

1. Fork το repository
2. Δημιουργήστε ένα feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit τις αλλαγές σας (`git commit -m 'Add some AmazingFeature'`)
4. Push στο branch (`git push origin feature/AmazingFeature`)
5. Ανοίξτε ένα Pull Request

### Development Guidelines

- Τηρήστε τα TypeScript types (strict mode enabled)
- Ακολουθήστε το existing code style
- Προσθέστε comments όπου χρειάζεται
- Βεβαιωθείτε ότι το build περνάει (`npm run build`)
- Τρέξτε type check (`npm run type-check`)
- Ελέγξτε για unused dependencies (`npm run deps:check`)

## 📄 Άδεια Χρήσης

Το project διατίθεται με την άδεια MIT. Δείτε το αρχείο [LICENSE](LICENSE) για περισσότερες πληροφορίες.

## 📞 Επικοινωνία

Για οποιεσδήποτε ερωτήσεις ή προτάσεις, επικοινωνήστε μαζί μου στο [xrhstosk59@gmail.com].