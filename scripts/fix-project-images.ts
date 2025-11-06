// scripts/fix-project-images.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProjectImages() {
  try {
    console.log('Updating project images to placeholder...');

    // Use a placeholder image service
    const placeholderImage = 'https://placehold.co/600x400/6366f1/white?text=Project';

    const { data, error } = await supabase
      .from('projects')
      .update({ image: placeholderImage })
      .like('image', '/uploads/projects/%')
      .select();

    if (error) {
      console.error('Error updating projects:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully updated ${data.length} projects`);
    console.log('Updated projects:', data.map(p => p.title));
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

fixProjectImages();
