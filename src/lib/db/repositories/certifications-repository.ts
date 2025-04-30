// src/lib/db/repositories/certifications-repository.ts
import { certifications as certificationsTable } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { desc, eq, sql } from 'drizzle-orm'
import { studentCertifications } from '@/lib/mock-certifications'
import { Certification, CertificationType } from '@/types/certifications'

// Τύπος που επιστρέφεται από τη βάση δεδομένων 
// Διαφέρει από τον Certification τύπο στο types/certifications.ts
type DBCertification = typeof certificationsTable.$inferSelect;

// Συνάρτηση για μετατροπή από DBCertification σε Certification
function mapDBCertificationToCertification(dbCert: DBCertification): Certification {
  return {
    id: dbCert.id,
    title: dbCert.title,
    issuer: dbCert.issuer,
    // Μετατροπή του Date σε string (αν είναι Date)
    issueDate: typeof dbCert.issueDate === 'string' 
      ? dbCert.issueDate 
      : dbCert.issueDate.toISOString(),
    expirationDate: dbCert.expirationDate 
      ? (typeof dbCert.expirationDate === 'string' 
          ? dbCert.expirationDate 
          : dbCert.expirationDate.toISOString()) 
      : undefined,
    credentialId: dbCert.credentialId || undefined,
    credentialUrl: dbCert.credentialUrl || undefined,
    description: dbCert.description || undefined,
    skills: dbCert.skills || [],
    type: dbCert.type as CertificationType, // Σωστή μετατροπή του τύπου
    filename: dbCert.filename,
    featured: dbCert.featured || false
  };
}

export const getCertifications = async (): Promise<Certification[]> => {
  try {
    // Προσπάθεια σύνδεσης με τη βάση δεδομένων
    const database = ensureDatabaseConnection();
    const result = await database.select()
      .from(certificationsTable)
      .orderBy(desc(certificationsTable.issueDate));
    
    // Μετατροπή των αποτελεσμάτων στον τύπο Certification
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : studentCertifications;
  } catch (error) {
    console.error('Database error when fetching certifications:', error);
    // Επιστροφή mock data σε περίπτωση σφάλματος
    return studentCertifications;
  }
}

export const getCertificationById = async (id: string): Promise<Certification | undefined> => {
  try {
    const database = ensureDatabaseConnection();
    const [certification] = await database.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.id, id))
      .limit(1);
    
    // Μετατροπή του αποτελέσματος αν υπάρχει
    return certification 
      ? mapDBCertificationToCertification(certification) 
      : studentCertifications.find(cert => cert.id === id);
  } catch (error) {
    console.error(`Database error when fetching certification with id ${id}:`, error);
    // Επιστροφή του αντίστοιχου mock certification
    return studentCertifications.find(cert => cert.id === id);
  }
}

export const getFeaturedCertifications = async (): Promise<Certification[]> => {
  try {
    const database = ensureDatabaseConnection();
    const result = await database.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.featured, true))
      .orderBy(desc(certificationsTable.issueDate));
    
    // Μετατροπή των αποτελεσμάτων
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : studentCertifications.filter(cert => cert.featured);
  } catch (error) {
    console.error('Database error when fetching featured certifications:', error);
    // Επιστροφή των featured από τα mock data
    return studentCertifications.filter(cert => cert.featured);
  }
}

export const getCertificationsBySkill = async (skill: string): Promise<Certification[]> => {
  try {
    const database = ensureDatabaseConnection();
    const result = await database.select()
      .from(certificationsTable)
      .where(sql`${skill} = ANY(${certificationsTable.skills})`)
      .orderBy(desc(certificationsTable.issueDate));
    
    // Μετατροπή των αποτελεσμάτων
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : studentCertifications.filter(cert => cert.skills?.includes(skill));
  } catch (error) {
    console.error(`Database error when fetching certifications for skill ${skill}:`, error);
    // Επιστροφή των αντίστοιχων mock data
    return studentCertifications.filter(cert => cert.skills?.includes(skill));
  }
}