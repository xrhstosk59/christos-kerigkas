// src/lib/storage.ts
import { supabaseManager, SupabaseError } from './supabase'

const BUCKET_NAME = 'profiles'

/**
 * Ανεβάζει μια εικόνα προφίλ στο Supabase Storage
 * @param file Buffer του αρχείου προς ανέβασμα
 * @param filename Όνομα αρχείου
 * @returns URL της εικόνας που ανέβηκε
 */
export async function uploadProfileImage(file: Buffer, filename: string): Promise<string> {
  try {
    // Χρησιμοποιούμε το supabaseManager αντί για απευθείας το supabase
    if (!supabaseManager.isClientAvailable()) {
      throw new SupabaseError('Supabase client is not initialized')
    }
    
    // Ανέβασμα του αρχείου στο Supabase Storage με χειρισμό σφαλμάτων
    const uploadResult = await supabaseManager.getClient().storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        contentType: 'image/jpeg', // Adjust based on file type if needed
        upsert: true // Overwrite if exists
      })
  
    if (uploadResult.error) {
      console.error('Error uploading to Supabase:', uploadResult.error)
      throw new SupabaseError(`Failed to upload image: ${uploadResult.error.message}`, uploadResult.error)
    }

    // Λήψη του public URL
    const publicUrlData = supabaseManager.getClient().storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadResult.data?.path || filename)

    return publicUrlData.data.publicUrl
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error('Error in uploadProfileImage:', error)
    throw new SupabaseError('Failed to upload profile image', error)
  }
}

/**
 * Διαγράφει μια εικόνα προφίλ από το Supabase Storage
 * @param filepath Διαδρομή ή URL του αρχείου προς διαγραφή
 */
export async function deleteProfileImage(filepath: string): Promise<void> {
  try {
    if (!supabaseManager.isClientAvailable()) {
      throw new SupabaseError('Supabase client is not initialized')
    }
    
    // Εξαγωγή του ονόματος αρχείου από το πλήρες URL ή διαδρομή
    const filename = filepath.split('/').pop()
    
    if (!filename) {
      throw new SupabaseError('Invalid file path')
    }

    // Διαγραφή του αρχείου από το Supabase Storage
    const deleteResult = await supabaseManager.getClient().storage
      .from(BUCKET_NAME)
      .remove([filename])

    if (deleteResult.error) {
      console.error('Error deleting from Supabase:', deleteResult.error)
      throw new SupabaseError(`Failed to delete image: ${deleteResult.error.message}`, deleteResult.error)
    }
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error('Error in deleteProfileImage:', error)
    throw new SupabaseError('Failed to delete profile image', error)
  }
}

/**
 * Μετατροπή URL σε filename για χρήση με το Supabase Storage
 * @param url URL του αρχείου
 * @returns Όνομα αρχείου ή null αν δεν μπορεί να εξαχθεί
 */
export function getFilenameFromUrl(url: string): string | null {
  try {
    // Handle full Supabase URLs
    if (url.includes(BUCKET_NAME)) {
      const filename = url.split('/').pop() || null;
      return filename;
    }
    // Handle relative paths
    if (url.startsWith('/')) {
      const filename = url.split('/').pop() || null;
      return filename;
    }
    return null;
  } catch (error) {
    console.error('Error extracting filename:', error)
    return null
  }
}

/**
 * Έλεγχος αν ένα URL είναι Supabase URL
 * @param url URL προς έλεγχο
 * @returns true αν είναι Supabase URL, αλλιώς false
 */
export function isSupabaseUrl(url: string): boolean {
  // Προσθέτουμε έλεγχο για το αν το url είναι string
  if (typeof url !== 'string') return false
  return url.includes('supabase') || url.includes(BUCKET_NAME)
}