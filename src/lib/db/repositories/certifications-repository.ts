// src/lib/db/repositories/certifications-repository.ts
import { certifications as certificationsTable } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { desc, eq, sql } from 'drizzle-orm'
import { Certification, CertificationType } from '@/types/certifications'

// Τύπος που επιστρέφεται από τη βάση δεδομένων 
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
    type: dbCert.type as CertificationType,
    filename: dbCert.filename,
    featured: dbCert.featured || false
  };
}

// Δημιουργία και εξαγωγή του αντικειμένου repository
export const certificationsRepository = {
  // Αναζήτηση όλων των πιστοποιητικών
  findAll: async (): Promise<DBCertification[]> => {
    try {
      // Προσπάθεια σύνδεσης με τη βάση δεδομένων
      const database = await ensureDatabaseConnection(); // Προσθέτουμε await
      return await database.select()
        .from(certificationsTable)
        .orderBy(desc(certificationsTable.issueDate));
    } catch (error) {
      console.error('Database error when fetching certifications:', error);
      return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
    }
  },

  // Αναζήτηση πιστοποιητικού με βάση το id
  findById: async (id: string): Promise<DBCertification | undefined> => {
    try {
      const database = await ensureDatabaseConnection(); // Προσθέτουμε await
      const [certification] = await database.select()
        .from(certificationsTable)
        .where(eq(certificationsTable.id, id))
        .limit(1);
      
      return certification;
    } catch (error) {
      console.error(`Database error when fetching certification with id ${id}:`, error);
      return undefined;
    }
  },

  // Αναζήτηση επιλεγμένων πιστοποιητικών
  findFeatured: async (): Promise<DBCertification[]> => {
    try {
      const database = await ensureDatabaseConnection(); // Προσθέτουμε await
      return await database.select()
        .from(certificationsTable)
        .where(eq(certificationsTable.featured, true))
        .orderBy(desc(certificationsTable.issueDate));
    } catch (error) {
      console.error('Database error when fetching featured certifications:', error);
      return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
    }
  },

  // Αναζήτηση πιστοποιητικών με βάση ένα skill
  findBySkill: async (skill: string): Promise<DBCertification[]> => {
    try {
      const database = await ensureDatabaseConnection(); // Προσθέτουμε await
      return await database.select()
        .from(certificationsTable)
        .where(sql`${skill} = ANY(${certificationsTable.skills})`)
        .orderBy(desc(certificationsTable.issueDate));
    } catch (error) {
      console.error(`Database error when fetching certifications for skill ${skill}:`, error);
      return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
    }
  }
};

// Διατηρούμε και τις προηγούμενες συναρτήσεις για backwards compatibility
export const getCertifications = async (): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findAll();
    
    // Μετατροπή των αποτελεσμάτων στον τύπο Certification
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  } catch (error) {
    console.error('Error in getCertifications:', error);
    return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  }
}

export const getCertificationById = async (id: string): Promise<Certification | undefined> => {
  try {
    const certification = await certificationsRepository.findById(id);
    
    // Μετατροπή του αποτελέσματος αν υπάρχει
    return certification 
      ? mapDBCertificationToCertification(certification) 
      : undefined; // Επιστρέφουμε undefined αντί για mock δεδομένα
  } catch (error) {
    console.error(`Error in getCertificationById:`, error);
    return undefined; // Επιστρέφουμε undefined αντί για mock δεδομένα
  }
}

export const getFeaturedCertifications = async (): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findFeatured();
    
    // Μετατροπή των αποτελεσμάτων
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  } catch (error) {
    console.error('Error in getFeaturedCertifications:', error);
    return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  }
}

export const getCertificationsBySkill = async (skill: string): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findBySkill(skill);
    
    // Μετατροπή των αποτελεσμάτων
    return result.length > 0 
      ? result.map(mapDBCertificationToCertification) 
      : []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  } catch (error) {
    console.error(`Error in getCertificationsBySkill:`, error);
    return []; // Επιστρέφουμε κενό πίνακα αντί για mock δεδομένα
  }
}