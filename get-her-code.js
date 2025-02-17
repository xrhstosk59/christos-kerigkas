const fs = require('fs/promises');
const path = require('path');

// Configuration constants updated for Next.js project structure
const CONFIG = {
  allowedExtensions: [
    '.js', '.jsx', '.ts', '.tsx', 
    '.css', '.json', '.svg', '.ico',
    '.md', '.png', '.jpg', '.jpeg', '.gif'
  ],
  imageExtensions: [
    '.svg', '.ico', '.png', '.jpg', 
    '.jpeg', '.gif'
  ],
  excludedFiles: [
    'package-lock.json',
    'code-dump.txt',
    'paths.txt',
    'paths-src.txt',
    'paths-public.txt',
    'frontend-code.txt',
    'backend-code.txt',
    'shared-code.txt',
    'config-code.txt',
    'README.md',
    '.env.local',
    '.gitignore',
    '.npmrc',
  ],
  excludedFolders: [
    '.next',
    'node_modules',
    'coverage',
    'dist',
    'build',
    '.git'
  ],
  outputFiles: {
    frontend: 'code/frontend-code.txt',
    backend: 'code/backend-code.txt',
    shared: 'code/shared-code.txt',
    config: 'code/config-code.txt'
  }
};

// Updated pattern matcher for Next.js project
class PatternMatcher {
  constructor() {
    this.basePatterns = {
      frontend: [
        '/src/components/',
        '/src/app/blog/',
        '/src/app/page.',
        '/src/app/layout.',
        '/src/app/loading.',
        '/src/app/error.',
        '/src/app/globals.css',
        'favicon.',
        '/public/',
        'theme',
        'optimizedimage',
        'markdown',
        'navbar',
        'footer',
        'hero',
      ],
      backend: [
        '/src/app/api/',
        '/src/lib/services/',
        'route.ts',
        'middleware.ts',
        'robot.ts',
        'sitemap.ts',
      ],
      shared: [
        '/src/lib/utils/',
        '/src/lib/seo.',
        '/src/lib/navigation.',
        '/src/lib/image-loader.',
        '/src/types/',
        '/src/content/',
        'utils.',
        'types.',
        'analytics.',
      ],
      config: [
        'tsconfig.',
        'package.json',
        'next.config.',
        'tailwind.config.',
        'postcss.config.',
        'jest.config.',
        '.env'
      ]
    };

    this.learnedPatterns = {
      frontend: new Set(),
      backend: new Set(),
      shared: new Set(),
      config: new Set()
    };
  }

  // Learn new patterns from existing file structure
  async learnFromDirectory(dir) {
    try {
      const files = await this.getAllFiles(dir);
      const categoryMap = new Map();

      for (const file of files) {
        const category = this.categorizeWithConfidence(file);
        if (category) {
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category).push(file);
        }
      }

      for (const [category, files] of categoryMap) {
        this.learnPatternsFromFiles(category, files);
      }

      return true;
    } catch (error) {
      console.error('Error learning patterns:', error);
      return false;
    }
  }

  async getAllFiles(dir) {
    const files = [];
    async function traverse(currentDir) {
      const items = await fs.readdir(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory() && !CONFIG.excludedFolders.includes(item)) {
          await traverse(fullPath);
        } else if (!CONFIG.excludedFiles.includes(item)) {
          const ext = path.extname(item);
          if (CONFIG.allowedExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }
    await traverse(dir);
    return files;
  }

  learnPatternsFromFiles(category, files) {
    for (const file of files) {
      const normalizedPath = file.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      
      // Learn from directory structure
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part && !this.basePatterns[category].some(p => p.includes(part))) {
          this.learnedPatterns[category].add(part);
        }
      }

      // Learn from file naming patterns
      const fileName = parts[parts.length - 1];
      const namePatterns = this.extractNamePatterns(fileName);
      namePatterns.forEach(pattern => {
        this.learnedPatterns[category].add(pattern);
      });
    }
  }

  extractNamePatterns(fileName) {
    const patterns = new Set();
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Updated patterns for Next.js components and pages
    const suffixes = [
      'page', 'layout', 'loading', 'error',
      'component', 'provider', 'boundary',
      'card', 'section'
    ];
    suffixes.forEach(suffix => {
      if (baseName.endsWith(suffix)) {
        patterns.add(suffix);
      }
    });

    const prefixes = ['use', 'is', 'has', 'get', 'set', 'create', 'update', 'delete'];
    prefixes.forEach(prefix => {
      if (baseName.startsWith(prefix)) {
        patterns.add(prefix);
      }
    });

    return patterns;
  }

  categorizeWithConfidence(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Check base patterns first
    for (const [category, patterns] of Object.entries(this.basePatterns)) {
      if (patterns.some(pattern => normalizedPath.includes(pattern))) {
        return category;
      }
    }

    // Use learned patterns if base patterns don't match
    for (const [category, patterns] of Object.entries(this.learnedPatterns)) {
      if ([...patterns].some(pattern => normalizedPath.includes(pattern))) {
        return category;
      }
    }

    // Next.js specific categorization
    if (normalizedPath.includes('/app/') && !normalizedPath.includes('/api/')) {
      return 'frontend';
    }
    if (normalizedPath.includes('/components/')) {
      return 'frontend';
    }
    if (normalizedPath.includes('/api/') || normalizedPath.endsWith('route.ts')) {
      return 'backend';
    }
    if (normalizedPath.includes('/lib/') || normalizedPath.includes('/types/')) {
      return 'shared';
    }

    return null;
  }

  async analyzeFileContent(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const indicators = {
        frontend: [
          'React', 'useState', 'useEffect', 'component',
          '<div', 'className', 'export default function Page',
          'layout.tsx', 'loading.tsx'
        ],
        backend: [
          'export async function', 'NextResponse', 'NextRequest',
          'route.ts', 'middleware', 'api'
        ],
        shared: [
          'interface', 'type', 'enum', 'export const',
          'utils', 'helpers', 'lib'
        ],
        config: [
          'module.exports', 'export default {',
          'configuration', 'config'
        ]
      };

      const matches = {};
      for (const [category, patterns] of Object.entries(indicators)) {
        matches[category] = patterns.filter(pattern => content.includes(pattern)).length;
      }

      const maxMatches = Math.max(...Object.values(matches));
      const category = Object.keys(matches).find(key => matches[key] === maxMatches);
      
      return maxMatches > 0 ? category : null;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }
}

// Main code organization class
class CodeOrganizer {
  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.stats = {
      total: 0,
      categorized: 0,
      uncategorized: 0,
      categories: {
        frontend: 0,
        backend: 0,
        shared: 0,
        config: 0
      }
    };
  }

  async organize(rootDir) {
    try {
      console.log('Starting Next.js code organization...');
      
      const codeFolder = path.join(rootDir, 'code');
      await fs.mkdir(codeFolder, { recursive: true });
      
      for (const file of Object.values(CONFIG.outputFiles)) {
        await fs.writeFile(path.join(rootDir, file), '', 'utf8');
      }

      console.log('Learning from Next.js project structure...');
      await this.patternMatcher.learnFromDirectory(rootDir);

      console.log('Processing files...');
      const files = await this.patternMatcher.getAllFiles(rootDir);
      this.stats.total = files.length;

      for (const file of files) {
        const category = await this.categorizeFile(file);
        if (category) {
          this.stats.categorized++;
          this.stats.categories[category]++;
          
          const ext = path.extname(file);
          const isImage = CONFIG.imageExtensions.includes(ext);
          
          let outputContent;
          if (isImage) {
            outputContent = `\n=== ${file} ===\n[Image File Present]\n\n`;
          } else {
            const content = await fs.readFile(file, 'utf8');
            outputContent = `\n=== ${file} ===\n${content}\n\n`;
          }
          
          const outputPath = path.join(rootDir, CONFIG.outputFiles[category]);
          await fs.appendFile(outputPath, outputContent, 'utf8');
        } else {
          this.stats.uncategorized++;
          console.log(`Uncategorized file: ${file}`);
        }
      }

      this.printResults();

    } catch (error) {
      console.error('Error during code organization:', error);
      process.exit(1);
    }
  }

  async categorizeFile(filePath) {
    let category = this.patternMatcher.categorizeWithConfidence(filePath);
    
    if (!category) {
      category = await this.patternMatcher.analyzeFileContent(filePath);
    }

    return category;
  }

  printResults() {
    console.log('\n=== Next.js Code Organization Results ===');
    console.log('-'.repeat(50));
    console.log(`Total files processed: ${this.stats.total}`);
    console.log(`Successfully categorized: ${this.stats.categorized}`);
    console.log(`Uncategorized: ${this.stats.uncategorized}`);
    console.log('\nFiles per category:');
    for (const [category, count] of Object.entries(this.stats.categories)) {
      const outputFile = CONFIG.outputFiles[category];
      console.log(`${category.padEnd(10)}: ${count} files -> ${outputFile}`);
    }
    console.log('-'.repeat(50));

    if (this.stats.uncategorized > 0) {
      console.log('\nNote: Some files were not categorized. You may want to:');
      console.log('1. Check the console output for uncategorized files');
      console.log('2. Review the file structure in src/app and src/components');
      console.log('3. Adjust the patterns in the PatternMatcher\n');
    }
  }
}

// Start the organization process
const organizer = new CodeOrganizer();
organizer.organize(process.cwd())
  .then(() => console.log('Next.js code organization completed successfully!'))
  .catch(error => {
    console.error('Error during code organization:', error);
    process.exit(1);
  });