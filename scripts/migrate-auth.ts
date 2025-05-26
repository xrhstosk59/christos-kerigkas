// scripts/migrate-auth.ts
import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'

/**
 * Script για την αυτόματη μετάβαση του authentication κώδικα
 * 
 * Εκτέλεση: npx tsx scripts/migrate-auth.ts
 */

// Παλιά imports που πρέπει να αντικατασταθούν
const oldImports = [
  {
    pattern: /from ['"]@\/lib\/auth\/client-auth['"]/g,
    replacement: `from '@/lib/supabase/client'`
  },
  {
    pattern: /from ['"]@\/lib\/auth\/supabase-auth-client['"]/g,
    replacement: `from '@/lib/supabase/client'`
  },
  {
    pattern: /from ['"]@\/lib\/auth\/supabase['"]/g,
    replacement: `from '@/lib/supabase/client'`
  },
  {
    pattern: /from ['"]@\/lib\/auth\/server-auth['"]/g,
    replacement: `from '@/lib/supabase/server'`
  },
  {
    pattern: /createServerSupabaseClient/g,
    replacement: `createClient`
  },
  {
    pattern: /supabaseAuthClient/g,
    replacement: `supabaseClient`
  },
  {
    pattern: /supabaseAuthManager/g,
    replacement: `supabaseClient`
  }
]

// Αντικατάσταση getSession με getUser
const sessionReplacements = [
  {
    pattern: /\.auth\.getSession\(\)/g,
    replacement: `.auth.getUser()`
  },
  {
    pattern: /const\s*{\s*data:\s*{\s*session\s*}\s*}/g,
    replacement: `const { data: { user } }`
  },
  {
    pattern: /data\.session/g,
    replacement: `data.user`
  },
  {
    pattern: /!session/g,
    replacement: `!user`
  },
  {
    pattern: /session\?/g,
    replacement: `user?`
  }
]

// Αρχεία που πρέπει να διαγραφούν
const filesToDelete = [
  'src/lib/auth/client-auth.ts',
  'src/lib/auth/supabase-auth-client.ts',
  'src/lib/auth/supabase.ts',
  'src/lib/auth/server-auth.ts',
  'src/lib/auth/auth.ts',
  'src/lib/auth/common.ts',
  'src/lib/auth/index.ts'
]

// Αρχεία που πρέπει να εξαιρεθούν από την αναζήτηση
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/scripts/migrate-auth.ts'
]

async function migrateFile(filePath: string) {
  try {
    let content = await fs.readFile(filePath, 'utf-8')
    let modified = false

    // Εφαρμογή αντικαταστάσεων για imports
    for (const { pattern, replacement } of oldImports) {
      const newContent = content.replace(pattern, replacement)
      if (newContent !== content) {
        content = newContent
        modified = true
      }
    }

    // Εφαρμογή αντικαταστάσεων για getSession
    for (const { pattern, replacement } of sessionReplacements) {
      const newContent = content.replace(pattern, replacement)
      if (newContent !== content) {
        content = newContent
        modified = true
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8')
      console.log(`✅ Migrated: ${filePath}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error)
    return false
  }
}

async function deleteOldFiles() {
  for (const file of filesToDelete) {
    const filePath = path.join(process.cwd(), file)
    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      console.log(`🗑️  Deleted: ${file}`)
    } catch {
      // Αρχείο δεν υπάρχει, οπότε δεν χρειάζεται διαγραφή
    }
  }
}

async function main() {
  console.log('🚀 Starting authentication migration...\n')

  // Βρες όλα τα TypeScript και JavaScript αρχεία
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: excludePatterns
  })

  console.log(`Found ${files.length} files to check...\n`)

  let migratedCount = 0

  // Μετάβαση κάθε αρχείου
  for (const file of files) {
    const migrated = await migrateFile(file)
    if (migrated) {
      migratedCount++
    }
  }

  console.log(`\n✨ Migrated ${migratedCount} files`)

  // Διαγραφή παλιών αρχείων
  console.log('\n🧹 Cleaning up old files...')
  await deleteOldFiles()

  console.log('\n✅ Migration complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Review the changes with: git diff')
  console.log('2. Test the application thoroughly')
  console.log('3. Update any remaining manual references')
  console.log('4. Don\'t forget to update your environment variables in production!')
}

// Εκτέλεση του script
main().catch(console.error)