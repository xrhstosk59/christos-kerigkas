// scripts/check-auth-usage.ts
import { promises as fs } from 'fs'
import { glob } from 'glob'
import chalk from 'chalk'

/**
 * Script για έλεγχο της σωστής χρήσης του νέου auth system
 * 
 * Εκτέλεση: npx tsx scripts/check-auth-usage.ts
 */

interface Issue {
  file: string
  line: number
  issue: string
  severity: 'error' | 'warning'
}

const issues: Issue[] = []

// Patterns που ΔΕΝ πρέπει να υπάρχουν πλέον
const forbiddenPatterns = [
  {
    pattern: /getSession\(\)/g,
    message: 'Χρήση getSession() - πρέπει να αντικατασταθεί με getUser()',
    severity: 'error' as const
  },
  {
    pattern: /createServerSupabaseClient/g,
    message: 'Χρήση παλιού createServerSupabaseClient',
    severity: 'error' as const
  },
  {
    pattern: /supabaseAuthClient/g,
    message: 'Χρήση παλιού supabaseAuthClient',
    severity: 'error' as const
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\//g,
    message: 'Import από παλιό auth directory',
    severity: 'error' as const
  },
  {
    pattern: /unsafe-inline.*unsafe-eval/g,
    message: 'Ασθενές CSP με unsafe-inline και unsafe-eval',
    severity: 'warning' as const
  }
]

// Patterns που ΠΡΕΠΕΙ να υπάρχουν σε συγκεκριμένα αρχεία
const requiredPatterns = [
  {
    filePattern: /middleware\.ts$/,
    patterns: [
      {
        pattern: /getUser\(\)/,
        message: 'Το middleware πρέπει να χρησιμοποιεί getUser()'
      },
      {
        pattern: /updateSession/,
        message: 'Το middleware πρέπει να καλεί updateSession'
      }
    ]
  },
  {
    filePattern: /\/api\//,
    patterns: [
      {
        pattern: /getUser\(\)|requireAuth\(\)/,
        message: 'Τα API routes πρέπει να ελέγχουν authentication'
      }
    ]
  }
]

async function checkFile(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')

    // Έλεγχος για forbidden patterns
    lines.forEach((line, index) => {
      forbiddenPatterns.forEach(({ pattern, message, severity }) => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: index + 1,
            issue: message,
            severity
          })
        }
      })
    })

    // Έλεγχος για required patterns
    requiredPatterns.forEach(({ filePattern, patterns }) => {
      if (filePattern.test(filePath)) {
        patterns.forEach(({ pattern, message }) => {
          if (!pattern.test(content)) {
            issues.push({
              file: filePath,
              line: 0,
              issue: `Missing: ${message}`,
              severity: 'warning'
            })
          }
        })
      }
    })

    // Ειδικοί έλεγχοι
    if (filePath.includes('/api/') && !filePath.includes('public')) {
      // Έλεγχος για rate limiting σε API routes
      if (!content.includes('rateLimitResult') && !content.includes('checkRateLimit')) {
        issues.push({
          file: filePath,
          line: 0,
          issue: 'API route χωρίς rate limiting',
          severity: 'warning'
        })
      }
    }

  } catch (error) {
    console.error(`Error checking ${filePath}:`, error)
  }
}

async function checkEnvironmentVariables(): Promise<void> {
  try {
    const envContent = await fs.readFile('.env.local', 'utf-8')
    
    // Έλεγχος για exposed credentials
    if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      issues.push({
        file: '.env.local',
        line: 0,
        issue: 'Service role key ΔΕΝ πρέπει να είναι στο .env.local',
        severity: 'error'
      })
    }

    // Έλεγχος για plain text passwords
    const passwordMatches = envContent.match(/PASS.*=.*[^*]/gm)
    if (passwordMatches) {
      issues.push({
        file: '.env.local',
        line: 0,
        issue: 'Plain text passwords βρέθηκαν στο .env.local',
        severity: 'warning'
      })
    }
  } catch {
    // .env.local might not exist - ignore error
  }
}

async function main() {
  console.log(chalk.blue('🔍 Checking authentication implementation...\n'))

  // Βρες όλα τα TypeScript και JavaScript αρχεία
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
  })

  // Έλεγχος κάθε αρχείου
  for (const file of files) {
    await checkFile(file)
  }

  // Έλεγχος environment variables
  await checkEnvironmentVariables()

  // Εμφάνιση αποτελεσμάτων
  if (issues.length === 0) {
    console.log(chalk.green('✅ No issues found! Authentication migration is complete.\n'))
  } else {
    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')

    console.log(chalk.red(`\n❌ Found ${errors.length} errors and ${warnings.length} warnings:\n`))

    // Εμφάνιση errors πρώτα
    if (errors.length > 0) {
      console.log(chalk.red('ERRORS:'))
      errors.forEach(({ file, line, issue }) => {
        console.log(chalk.red(`  ${file}${line > 0 ? `:${line}` : ''} - ${issue}`))
      })
      console.log()
    }

    // Εμφάνιση warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow('WARNINGS:'))
      warnings.forEach(({ file, line, issue }) => {
        console.log(chalk.yellow(`  ${file}${line > 0 ? `:${line}` : ''} - ${issue}`))
      })
    }

    console.log(chalk.blue('\n📝 Run `npm run migrate:auth` to automatically fix some issues.'))
    
    // Exit με error code αν υπάρχουν errors
    if (errors.length > 0) {
      process.exit(1)
    }
  }
}

// Εκτέλεση
main().catch(console.error)