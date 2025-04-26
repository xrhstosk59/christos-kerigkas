// src/lib/storage.ts
import { supabase } from './supabase'

const BUCKET_NAME = 'profiles'

export async function uploadProfileImage(file: Buffer, filename: string): Promise<string> {
  try {
    // Έλεγχος ότι το supabase client υπάρχει
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }
    
    // Ανέβασμα του αρχείου στο Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        contentType: 'image/jpeg', // Adjust based on file type if needed
        upsert: true // Overwrite if exists
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Λήψη του public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(data?.path || filename)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error in uploadProfileImage:', error)
    throw error
  }
}

export async function deleteProfileImage(filepath: string): Promise<void> {
  try {
    // Έλεγχος ότι το supabase client υπάρχει
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }
    
    // Εξαγωγή του ονόματος αρχείου από το πλήρες URL ή διαδρομή
    const filename = filepath.split('/').pop()
    
    if (!filename) {
      throw new Error('Invalid file path')
    }

    // Διαγραφή του αρχείου από το Supabase Storage
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([filename])

    if (error) {
      console.error('Error deleting from Supabase:', error)
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteProfileImage:', error)
    throw error
  }
}

// Μετατροπή URL σε filename για χρήση με το Supabase Storage
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

// Έλεγχος αν ένα URL είναι Supabase URL
export function isSupabaseUrl(url: string): boolean {
  // Προσθέτουμε έλεγχο για το αν το url είναι string
  if (typeof url !== 'string') return false
  return url.includes('supabase') || url.includes(BUCKET_NAME)
}