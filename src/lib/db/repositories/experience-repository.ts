// src/lib/db/repositories/experience-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';
import { Experience } from '@/types/cv';

// Types based on Supabase schema
type DBExperience = Database['public']['Tables']['experience']['Row'];

// Function to map DBExperience to Experience
function mapDBExperienceToExperience(dbExp: DBExperience): Experience {
  return {
    id: dbExp.id,
    company: dbExp.company,
    position: dbExp.position,
    startDate: dbExp.start_date,
    endDate: dbExp.end_date || null,
    description: dbExp.description,
    location: dbExp.location || undefined,
    responsibilities: dbExp.responsibilities || [],
    technologies: dbExp.technologies || [],
    achievements: dbExp.achievements || [],
    companyUrl: dbExp.company_url || undefined
  };
}

// Create and export the repository object
export const experienceRepository = {
  // Find all experience entries
  findAll: async (): Promise<DBExperience[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Database error when fetching experience:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error when fetching experience:', error);
      return [];
    }
  },

  // Find experience by id
  findById: async (id: string): Promise<DBExperience | undefined> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Database error when fetching experience with id ${id}:`, error);
        return undefined;
      }

      return data || undefined;
    } catch (error) {
      console.error(`Database error when fetching experience with id ${id}:`, error);
      return undefined;
    }
  }
};

// Export function for backwards compatibility
export const getExperience = async (): Promise<Experience[]> => {
  try {
    const result = await experienceRepository.findAll();

    return result.length > 0
      ? result.map(mapDBExperienceToExperience)
      : [];
  } catch (error) {
    console.error('Error in getExperience:', error);
    return [];
  }
};
