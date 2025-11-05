// src/lib/db/repositories/certifications-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';
import { Certification, CertificationType } from '@/types/certifications';

// Types based on Supabase schema
type DBCertification = Database['public']['Tables']['certifications']['Row'];

// Function to map DBCertification to Certification
function mapDBCertificationToCertification(dbCert: DBCertification): Certification {
  return {
    id: dbCert.id.toString(),
    title: dbCert.title,
    issuer: dbCert.issuer,
    issueDate: dbCert.issue_date,
    expirationDate: dbCert.expiry_date || undefined,
    credentialId: dbCert.credential_id || undefined,
    credentialUrl: dbCert.credential_url || undefined,
    description: dbCert.description || undefined,
    skills: dbCert.skills || [],
    type: dbCert.type as CertificationType,
    filename: dbCert.filename || '',
    featured: dbCert.featured || false
  };
}

// Create and export the repository object
export const certificationsRepository = {
  // Find all certifications
  findAll: async (): Promise<DBCertification[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Database error when fetching certifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error when fetching certifications:', error);
      return [];
    }
  },

  // Find certification by id
  findById: async (id: string): Promise<DBCertification | undefined> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Database error when fetching certification with id ${id}:`, error);
        return undefined;
      }

      return data || undefined;
    } catch (error) {
      console.error(`Database error when fetching certification with id ${id}:`, error);
      return undefined;
    }
  },

  // Find featured certifications
  findFeatured: async (): Promise<DBCertification[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('featured', true)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Database error when fetching featured certifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error when fetching featured certifications:', error);
      return [];
    }
  },

  // Find certifications by skill
  findBySkill: async (skill: string): Promise<DBCertification[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      // Using PostgreSQL array contains operator
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .contains('skills', [skill])
        .order('issue_date', { ascending: false });

      if (error) {
        console.error(`Database error when fetching certifications for skill ${skill}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Database error when fetching certifications for skill ${skill}:`, error);
      return [];
    }
  }
};

// Keep previous functions for backwards compatibility
export const getCertifications = async (): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findAll();

    return result.length > 0
      ? result.map(mapDBCertificationToCertification)
      : [];
  } catch (error) {
    console.error('Error in getCertifications:', error);
    return [];
  }
};

export const getCertificationById = async (id: string): Promise<Certification | undefined> => {
  try {
    const certification = await certificationsRepository.findById(id);

    return certification
      ? mapDBCertificationToCertification(certification)
      : undefined;
  } catch (error) {
    console.error(`Error in getCertificationById:`, error);
    return undefined;
  }
};

export const getFeaturedCertifications = async (): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findFeatured();

    return result.length > 0
      ? result.map(mapDBCertificationToCertification)
      : [];
  } catch (error) {
    console.error('Error in getFeaturedCertifications:', error);
    return [];
  }
};

export const getCertificationsBySkill = async (skill: string): Promise<Certification[]> => {
  try {
    const result = await certificationsRepository.findBySkill(skill);

    return result.length > 0
      ? result.map(mapDBCertificationToCertification)
      : [];
  } catch (error) {
    console.error(`Error in getCertificationsBySkill:`, error);
    return [];
  }
};
