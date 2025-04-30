// src/lib/ensure-uploads-dir.ts
import fs from 'fs';
import path from 'path';

/**
 * Δημιουργεί τον φάκελο uploads και όλους τους απαραίτητους υποφακέλους
 * με ασφαλή τρόπο, αποτρέποντας επιθέσεις path traversal
 * 
 * @param subDirectory Προαιρετικός υποφάκελος στον uploads φάκελο
 * @returns Πλήρες path του φακέλου που δημιουργήθηκε
 */
export async function ensureUploadsDir(subDirectory: string = ''): Promise<string> {
  // Έλεγχος για path traversal attempts
  if (subDirectory.includes('..') || subDirectory.startsWith('/') || subDirectory.startsWith('\\')) {
    throw new Error('Invalid subdirectory path');
  }
  
  // Βασικός φάκελος uploads
  const baseDir = path.join(process.cwd(), 'public');
  let uploadDir = path.join(baseDir, 'uploads');
  
  // Δημιουργία του βασικού φακέλου αν δεν υπάρχει
  if (!fs.existsSync(uploadDir)) {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    
    // Δημιουργία .gitkeep για να διατηρείται ο φάκελος στο Git
    const gitkeepPath = path.join(uploadDir, '.gitkeep');
    await fs.promises.writeFile(gitkeepPath, '');
  }
  
  // Αν υπάρχει υποφάκελος, τον δημιουργούμε
  if (subDirectory) {
    // Δημιουργία του πλήρους μονοπατιού
    uploadDir = path.join(uploadDir, ...subDirectory.split('/'));
    
    // Δημιουργία του υποφακέλου αν δεν υπάρχει
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }
  }
  
  return uploadDir;
}

/**
 * Ελέγχει αν ένα όνομα αρχείου είναι μέσα στον φάκελο uploads
 * για να αποτρέψει path traversal επιθέσεις
 * 
 * @param filename Το όνομα του αρχείου που θα ελεγχθεί
 * @returns Boolean που δείχνει αν το path είναι ασφαλές
 */
export function isPathSafe(filename: string): boolean {
  const fullPath = path.resolve(path.join(process.cwd(), 'public', 'uploads', filename));
  const uploadsDir = path.resolve(path.join(process.cwd(), 'public', 'uploads'));
  
  // Το path είναι ασφαλές μόνο αν βρίσκεται μέσα στον φάκελο uploads
  return fullPath.startsWith(uploadsDir);
}

/**
 * Καθαρίζει ένα όνομα αρχείου για να είναι ασφαλές για χρήση στο filesystem
 * 
 * @param filename Το αρχικό όνομα αρχείου
 * @returns Το ασφαλές όνομα αρχείου
 */
export function sanitizeFilename(filename: string): string {
  // Αφαίρεση ειδικών χαρακτήρων και path separators
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-') // Αντικατάσταση μη έγκυρων χαρακτήρων
    .replace(/\.\./g, '') // Αφαίρεση ..
    .replace(/\s+/g, '_'); // Αντικατάσταση κενών με underscores
}

/**
 * Δημιουργεί ένα μοναδικό όνομα αρχείου για να αποφευχθούν συγκρούσεις
 * 
 * @param originalFilename Το αρχικό όνομα αρχείου
 * @returns Ένα μοναδικό όνομα αρχείου με βάση το αρχικό
 */
export function createUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  
  return `${sanitizeFilename(name)}_${timestamp}_${random}${ext}`;
}

/**
 * Διαγράφει ένα αρχείο από τον φάκελο uploads
 * 
 * @param filename Το όνομα του αρχείου προς διαγραφή (χωρίς το πλήρες path)
 * @returns Promise που επιλύεται όταν ολοκληρωθεί η διαγραφή
 */
export async function deleteUploadedFile(filename: string): Promise<void> {
  // Έλεγχος για path traversal
  if (!isPathSafe(filename)) {
    throw new Error('Invalid filename path');
  }
  
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  // Έλεγχος αν το αρχείο υπάρχει
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}