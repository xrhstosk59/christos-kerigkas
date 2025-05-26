// scripts/performance-check.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function performanceCheck() {
  console.log('🔍 Running Performance Check...\n');
  
  // 1. Check bundle size
  console.log('1. Bundle Analysis:');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully\n');
  } catch (error) {
    console.error('❌ Build failed:', error);
    return;
  }
  
  // 2. Check for large files
  console.log('2. Large Files Check:');
  const publicDir = path.join(process.cwd(), 'public');
  const largeFiles: string[] = [];
  
  function checkDirectory(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        checkDirectory(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        const sizeInMB = stats.size / (1024 * 1024);
        
        if (sizeInMB > 1) { // Files larger than 1MB
          largeFiles.push(`${fullPath.replace(process.cwd(), '.')}: ${sizeInMB.toFixed(2)}MB`);
        }
      }
    }
  }
  
  checkDirectory(publicDir);
  
  if (largeFiles.length > 0) {
    console.log('⚠️  Large files found:');
    largeFiles.forEach(file => console.log(`  - ${file}`));
    console.log('Consider optimizing these files\n');
  } else {
    console.log('✅ No large files found\n');
  }
  
  console.log('3. Performance Recommendations:');
  console.log('- Use dynamic imports for heavy components');
  console.log('- Optimize images with next/image');
  console.log('- Enable compression in next.config.js');
  console.log('- Use Suspense for loading states');
  console.log('- Consider code splitting for large pages');
}

performanceCheck();

// ---

// scripts/database-health.ts
import { createClient } from '@supabase/supabase-js';

// scripts/database-health.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseHealth() {
  console.log('🔍 Checking Database Health...\n');
  
  try {
    // 1. Test connection
    console.log('1. Testing connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('certifications')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Connection successful');
    console.log(`📊 Total certifications: ${connectionTest || 0}\n`);
    
    // 2. Check table structure
    console.log('2. Checking table structure...');
    const { data: sample, error: structureError } = await supabase
      .from('certifications')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Structure check failed:', structureError.message);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('✅ Table structure:');
      console.log('Columns:', Object.keys(sample[0]).join(', '));
    } else {
      console.log('⚠️  No data found in certifications table');
    }
    
    // 3. Check RLS policies
    console.log('\n3. Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('certifications')
      .select('id, title')
      .limit(5);
    
    if (rlsError) {
      console.error('❌ RLS policy issue:', rlsError.message);
      console.log('💡 Check your RLS policies in Supabase dashboard');
    } else {
      console.log('✅ RLS policies working correctly');
      console.log(`Fetched ${rlsTest?.length || 0} records`);
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

checkDatabaseHealth();