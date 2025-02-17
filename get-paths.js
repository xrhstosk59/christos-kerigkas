const fs = require('fs');
const path = require('path');

// ----- ΡΥΘΜΙΣΕΙΣ ----- //
const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.html', '.css', '.json',
  '.env', '.md',
  '.txt',
  '.webmanifest',
];

const IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp',
  '.webp', '.svg', '.ico', '.glb'
];

const EXCLUDED_FILES = [
  'paths-public.txt',
];

const EXCLUDED_FOLDERS = [];

// ----- ΣΥΝΑΡΤΗΣΗ ΑΝΑΔΡΟΜΗΣ ----- //
function readFilesRecursively(dir, outputFile) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      if (EXCLUDED_FOLDERS.includes(item)) {
        return;
      }
      readFilesRecursively(fullPath, outputFile);
    } else {
      if (EXCLUDED_FILES.includes(item)) {
        return;
      }
      const ext = path.extname(item).toLowerCase();

      if (CODE_EXTENSIONS.includes(ext) || IMAGE_EXTENSIONS.includes(ext)) {
        const contentToAppend = `\nFILE: ${fullPath}\n`;
        fs.appendFileSync(outputFile, contentToAppend, 'utf8');
      }
    }
  });
}

// ----- ΚΥΡΙΩΣ ΛΕΙΤΟΥΡΓΙΑ ----- //
function createPathsFiles(folderToScan, outputFile) {
  // Δημιουργία του φακέλου code αν δεν υπάρχει
  const codeFolder = path.join(__dirname, 'code');
  if (!fs.existsSync(codeFolder)) {
    fs.mkdirSync(codeFolder);
  }

  // Ενημέρωση των paths των αρχείων εξόδου
  const outputPath = path.join(codeFolder, outputFile);
  fs.writeFileSync(outputPath, '', 'utf8');

  if (!fs.existsSync(folderToScan)) {
    console.error(`Δεν βρέθηκε ο φάκελος: ${folderToScan}`);
    return;
  }

  readFilesRecursively(folderToScan, outputPath);
  console.log(`\n✅ Η διαδικασία ολοκληρώθηκε! Δες το αρχείο "code/${outputFile}".\n`);
}

// ----- ΕΚΚΙΝΗΣΗ ----- //
const srcFolder = path.join(__dirname, 'src');
const srcOutputFile = 'paths-src.txt';
createPathsFiles(srcFolder, srcOutputFile);

const publicFolder = path.join(__dirname, 'public');
const publicOutputFile = 'paths-public.txt';
createPathsFiles(publicFolder, publicOutputFile);