// src/lib/db/repositories/skills-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';
import { Skill } from '@/types/cv';

// Types based on Supabase schema
type DBSkill = Database['public']['Tables']['skills']['Row'];

// Function to map DBSkill to Skill
function mapDBSkillToSkill(dbSkill: DBSkill): Skill {
  return {
    name: dbSkill.name,
    level: dbSkill.proficiency * 20, // Convert 1-5 scale to 1-100 scale
    category: dbSkill.category as any, // Use the category from database
    icon: dbSkill.icon || undefined
  };
}

// Create and export the repository object
export const skillsRepository = {
  // Find all skills
  findAll: async (): Promise<DBSkill[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Database error when fetching skills:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error when fetching skills:', error);
      return [];
    }
  },

  // Find skills by category
  findByCategory: async (category: string): Promise<DBSkill[]> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('category', category)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Database error when fetching skills for category ${category}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Database error when fetching skills for category ${category}:`, error);
      return [];
    }
  },

  // Find skill by id
  findById: async (id: string): Promise<DBSkill | undefined> => {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Database error when fetching skill with id ${id}:`, error);
        return undefined;
      }

      return data || undefined;
    } catch (error) {
      console.error(`Database error when fetching skill with id ${id}:`, error);
      return undefined;
    }
  }
};

// Export function for backwards compatibility
export const getSkills = async (): Promise<Skill[]> => {
  try {
    const result = await skillsRepository.findAll();

    return result.length > 0
      ? result.map(mapDBSkillToSkill)
      : [];
  } catch (error) {
    console.error('Error in getSkills:', error);
    return [];
  }
};
