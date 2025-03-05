// src/lib/ensure-uploads-dir.ts
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Ensures that the uploads directory exists in the public folder
 * This is important for storing and retrieving user uploads like profile images
 */
export function ensureUploadsDirectory(): void {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    
    // Create public directory if it doesn't exist (unlikely but just in case)
    if (!existsSync(publicDir)) {
      console.log('Creating public directory...');
      mkdirSync(publicDir, { recursive: true });
    }
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error ensuring uploads directory exists:', error);
  }
}