// src/lib/db/repositories/education-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';
import { Education } from '@/types/cv';

// Types based on Supabase schema
type DBEducation = Database['public']['Tables']['education']['Row'];

// Function to map DBEducation to Education
function mapDBEducationToEducation(dbEdu: DBEducation): Education {
  return {
    id: dbEdu.id,
    institution: dbEdu.institution,
    degree: dbEdu.degree,
    field: dbEdu.field,
    startDate: dbEdu.start_date,
    endDate: dbEdu.end_date || null,
    location: dbEdu.location || undefined,
    description: dbEdu.description || undefined,
    gpa: dbEdu.gpa ? Number(dbEdu.gpa) : undefined,
    achievements: dbEdu.achievements || []
  };
}

// Create and export the repository object
export const educationRepository = {
  // Find all education entries
  findAll: async (): Promise<DBEducation[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Database error when fetching education:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error when fetching education:', error);
      return [];
    }
  },

  // Find education by id
  findById: async (id: string): Promise<DBEducation | undefined> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Database error when fetching education with id ${id}:`, error);
        return undefined;
      }

      return data || undefined;
    } catch (error) {
      console.error(`Database error when fetching education with id ${id}:`, error);
      return undefined;
    }
  }
};

// Export function for backwards compatibility
export const getEducation = async (): Promise<Education[]> => {
  try {
    const result = await educationRepository.findAll();

    return result.length > 0
      ? result.map(mapDBEducationToEducation)
      : [];
  } catch (error) {
    console.error('Error in getEducation:', error);
    return [];
  }
};
