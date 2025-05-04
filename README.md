# Christos Kerigkas - Personal Portfolio

Ένα σύγχρονο, διαδραστικό portfolio κατασκευασμένο με Next.js 15, React 19, TypeScript και Tailwind CSS.

![Christos Kerigkas Portfolio](https://example.com/portfolio-preview.png)

## 🚀 Χαρακτηριστικά

- **Modern Stack**: Next.js 15, React 19, TypeScript και Tailwind CSS
- **Responsive Design**: Προσαρμόζεται σε όλες τις συσκευές (mobile, tablet, desktop)
- **Dark/Light Mode**: Πλήρης υποστήριξη σκοτεινού/φωτεινού θέματος
- **Διαδραστικό CV**: Με δυνατότητα εξαγωγής σε PDF
- **Blog Platform**: Ολοκληρωμένη λειτουργικότητα blog με αναζήτηση και κατηγορίες
- **Admin Panel**: Ασφαλές διαχειριστικό για ενημέρωση περιεχομένου
- **Animated UI**: Εντυπωσιακά animations με Framer Motion
- **SEO Optimized**: Βελτιστοποιημένο για μηχανές αναζήτησης
- **Fast Performance**: Server-side rendering και βελτιστοποιημένα assets
- **Contact Form**: Με rate limiting και αποθήκευση στη βάση δεδομένων
- **Newsletter**: Δυνατότητα εγγραφής σε newsletter
- **Analytics**: Ενσωματωμένη υποστήριξη για Google Analytics

## 📋 Προαπαιτούμενα

- Node.js 20.x ή νεότερη έκδοση
- npm ή yarn package manager
- Λογαριασμός Supabase για τη βάση δεδομένων και authentication
- (Προαιρετικά) Λογαριασμός Vercel για deployment

## 🛠️ Εγκατάσταση

1. **Κλωνοποίηση του repository**

```bash
git clone https://github.com/yourusername/christos-kerigkas.git
cd christos-kerigkas
```

2. **Εγκατάσταση εξαρτήσεων**

```bash
npm install
# ή
yarn install
```

3. **Ρύθμιση μεταβλητών περιβάλλοντος**

Δημιουργήστε ένα αρχείο `.env.local` στον ριζικό κατάλογο και προσθέστε τις απαραίτητες μεταβλητές περιβάλλοντος:

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

- `npm run dev` - Εκτέλεση σε development mode
- `npm run build` - Δημιουργία production build
- `npm run start` - Εκτέλεση του production build
- `npm run lint` - Έλεγχος linting
- `npm run db:generate` - Δημιουργία Drizzle migrations
- `npm run db:migrate` - Εκτέλεση database migrations
- `npm run db:studio` - Εκκίνηση του Drizzle Studio
- `npm run db:seed` - Εισαγωγή αρχικών δεδομένων στη βάση

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
- Διαχείριση blog posts
- Προβολή μηνυμάτων επικοινωνίας
- Διαχείριση newsletter εγγραφών
- Επεξεργασία προφίλ

## 📄 Άδεια Χρήσης

Το project διατίθεται με την άδεια MIT. Δείτε το αρχείο [LICENSE](LICENSE) για περισσότερες πληροφορίες.

## 📞 Επικοινωνία

Για οποιεσδήποτε ερωτήσεις ή προτάσεις, επικοινωνήστε μαζί μου στο [your-email@example.com].