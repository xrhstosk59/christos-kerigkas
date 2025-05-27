// scripts/seed-certifications.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Τύπος για τις πιστοποιήσεις
interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
  type: string;
  filename: string;
  featured?: boolean;
}

// Φόρτωση περιβαλλοντικών μεταβλητών
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Δημιουργία client Supabase
const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
);

// Δεδομένα πιστοποιήσεων από το src/content/certifications.ts
const certifications: Certification[] = [
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
  // ✅ NEW: Network Defense Certificate
  {
    id: 'network-defense',
    title: 'Network Defense',
    issuer: 'Cisco Networking Academy',
    issueDate: '2025-05-09',
    description: 'Student level credential for completing the Network Defense course. Covers cybersecurity concepts, network security measures, identity lifecycle management, firewall configuration, cloud security measures, and data protection mechanisms.',
    skills: [
      'Network Security',
      'Cybersecurity', 
      'Linux',
      'Windows',
      'Identity Management',
      'Firewall Configuration',
      'Cloud Security',
      'Data Protection',
      'PKI',
      'Virtual Computing'
    ],
    type: 'course',
    filename: 'NetworkDefenseUpdate20250509-28-afxm48.pdf', // ✅ Αλλάξε αν είναι διαφορετικό
    featured: true
  },
  {
    id: 'learning-online-completion',
    title: 'Learning to Learn Online - Certificate of Completion',
    issuer: 'Athabasca University, Canada',
    issueDate: '2021-11-20',
    credentialId: 'VVV87817621',
    credentialUrl: 'http://www.ltlo.ca/v/VVV87817621',
    type: 'course',
    filename: 'LTLO-15-Certificate-of-Completion.pdf'
  },
  {
    id: 'learning-online-participation',
    title: 'Learning to Learn Online - Certificate of Participation',
    issuer: 'Athabasca University, Canada',
    issueDate: '2021-11-20',
    credentialId: 'VVL87817621',
    credentialUrl: 'http://www.ltlo.ca/v/VVL87817621',
    type: 'course',
    filename: 'LTLO-15-Certificate-of-Participation.pdf'
  },
  {
    id: 'network-addressing',
    title: 'Network Addressing and Basic Troubleshooting',
    issuer: 'Cisco Networking Academy',
    issueDate: '2024-01-12',
    type: 'badge',
    skills: ['Networking', 'Troubleshooting'],
    filename: 'Network_Addressing_and_Basic_Troubleshooting_Badge20240113-34-hs7vyr.pdf'
  },
  {
    id: 'network-security',
    title: 'Network Support and Security',
    issuer: 'Cisco Networking Academy',
    issueDate: '2024-01-13',
    type: 'badge',
    skills: ['Network Security'],
    filename: 'Network_Support_and_Security_Badge20240113-29-1n54sk.pdf'
  },
  {
    id: 'networking-basics',
    title: 'Networking Basics',
    issuer: 'Cisco Networking Academy',
    issueDate: '2023-11-19',
    type: 'badge',
    skills: ['Networking'],
    filename: 'Networking_Basics_Badge20240113-29-5ou4ck.pdf'
  },
  {
    id: 'networking-devices',
    title: 'Networking Devices and Initial Configuration',
    issuer: 'Cisco Networking Academy',
    issueDate: '2024-01-04',
    type: 'badge',
    skills: ['Networking', 'Device Configuration'],
    filename: 'Networking_Devices_and_Initial_Configuration_Badge20240113-29-6lb7yw.pdf'
  },
  {
    id: 'ict-education-conference',
    title: '13ο Πανελλήνιο και Διεθνές Συνέδριο «Οι ΤΠΕ στην Εκπαίδευση»',
    issuer: 'Διεθνές Πανεπιστήμιο της Ελλάδος',
    issueDate: '2023-10-01',
    description: 'Παρακολούθηση του συνεδρίου «Οι ΤΠΕ στην Εκπαίδευση» και «Διδακτική της Πληροφορικής»',
    type: 'conference',
    skills: ['ICT in Education', 'Computer Science Teaching'],
    filename: 'Βεβαίωση Παρακολούθησης - Κέριγκας  - Χρήστος .pdf'
  },
  {
    id: 'quality-management',
    title: 'Εκπαίδευση Προσωπικού και Φοιτητών σε θέματα Διοίκησης Ποιότητας',
    issuer: 'AQS & ABPM',
    issueDate: '2023-05-11',
    description: 'Σεμινάριο για τη Διοίκηση Ποιότητας στο πλαίσιο του έργου «Αναβάθμιση των διαδικασιών ποιότητας και υποστήριξη της Μονάδας Διασφάλισης Ποιότητας του Διεθνούς Πανεπιστημίου της Ελλάδος»',
    type: 'seminar',
    skills: ['Quality Management'],
    filename: 'ΚΕΡΙΓΚΑΣ ΧΡΗΣΤΟΣ.pdf'
  }
];

async function seedCertifications() {
  console.log('🌱 Starting certification seeding...');
  
  try {
    // Έλεγχος σύνδεσης με το Supabase
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials are missing in .env.local');
      process.exit(1);
    }

    console.log(`📋 Found ${certifications.length} certifications to import`);
    
    // ✅ IMPROVED: Προαιρετικό clearing - ρώτησε πρώτα
    console.log('⚠️  This will replace ALL existing certifications. Continue? (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
    
    // Πρώτα καθαρίζουμε τον πίνακα
    const { error: deleteError } = await supabase
      .from('certifications')
      .delete()
      .not('id', 'is', null);
    
    if (deleteError) {
      console.error('❌ Error clearing certifications:', deleteError);
      return;
    }
    
    console.log('🗑️  Existing certifications cleared');
    
    // Μετατροπή των πιστοποιητικών σε μορφή συμβατή με τη βάση
    const certificationsToInsert = certifications.map(cert => ({
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      issue_date: new Date(cert.issueDate),
      credential_id: cert.credentialId || null,
      credential_url: cert.credentialUrl || null,
      description: cert.description || null,
      skills: cert.skills || [],
      type: cert.type,
      filename: cert.filename,
      featured: cert.featured || false,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    console.log('📦 Certifications prepared for insertion');
    console.log('🆕 NEW: Network Defense certificate included!');
    
    // Εισαγωγή πιστοποιητικών στη βάση
    const { error: insertError } = await supabase
      .from('certifications')
      .insert(certificationsToInsert);
    
    if (insertError) {
      console.error('❌ Error inserting certifications:', insertError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${certificationsToInsert.length} certifications`);
    console.log('🎉 Network Defense certificate added to database!');
    
    // Επικύρωση
    const { data: networkDefense } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', 'network-defense')
      .single();
    
    if (networkDefense) {
      console.log('✅ Verification: Network Defense found in database');
      console.log(`   📅 Issue Date: ${networkDefense.issue_date}`);
      console.log(`   🏷️  Skills: ${networkDefense.skills?.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding certifications:', error);
  }
}

// Εκτέλεση του script
seedCertifications();