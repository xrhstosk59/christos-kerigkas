// src/lib/ensure-uploads-dir.ts
import fs from 'fs';
import path from 'path';

/**
 * Δημιουργεί τον φάκελο για τα uploads αν δεν υπάρχει
 * @param {string} dir - Η διαδρομή του φακέλου που θέλουμε να δημιουργήσουμε
 */
export function ensureUploadsDir(dir: string): void {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Ο φάκελος δημιουργήθηκε επιτυχώς: ${dir}`);
    }
  } catch (error) {
    console.error(`Σφάλμα κατά τη δημιουργία του φακέλου: ${dir}`, error);
    throw error;
  }
}

/**
 * Δημιουργεί τον φάκελο για τα πιστοποιητικά
 */
export function ensureCertificatesDir(): void {
  const certificatesDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
  ensureUploadsDir(certificatesDir);
}