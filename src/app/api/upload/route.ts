// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { writeFile, unlink, mkdir, stat } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { z } from 'zod'
import crypto from 'crypto'
import { rateLimit } from '@/lib/rate-limit'

// Create limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, 
})

// File validation schema
const fileSchema = z.object({
  type: z.string().refine(val => 
    ['image/jpeg', 'image/png', 'image/webp'].includes(val), 
    { message: 'Only JPG, PNG, and WebP files are allowed' }
  ),
  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB')
})

// Generate a safe filename
function getSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(16).toString('hex')
  
  // Ensure we only use allowed extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const safeExt = allowedExtensions.includes(ext) ? ext : '.jpg'
  
  return `profile-${timestamp}-${randomString}${safeExt}`
}

// Security check for file type
async function verifyFileType(buffer: Buffer, type: string): Promise<boolean> {
  // Check magic numbers for common image formats
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46, -1, -1, -1, -1, 0x57, 0x45, 0x42, 0x50]]
  }

  if (!signatures[type]) return false

  const bytes = Array.from(buffer.slice(0, 12))
  
  return signatures[type].some(signature => 
    signature.every((byte, i) => 
      byte === -1 || byte === bytes[i]
    )
  )
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit - 5 uploads per minute per IP
    try {
      await limiter.check(5, `UPLOAD_${ip}`)
    } catch {
      return NextResponse.json(
        { error: 'Πάρα πολλές προσπάθειες αποστολής. Παρακαλώ δοκιμάστε αργότερα.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Δεν βρέθηκε αρχείο για αποστολή' },
        { status: 400 }
      )
    }

    // Validate file using zod schema
    const validationResult = fileSchema.safeParse({
      type: file.type,
      size: file.size
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    // Get file buffer and verify its actual type using magic numbers
    const buffer = Buffer.from(await file.arrayBuffer())
    const isValidFileType = await verifyFileType(buffer, file.type)
    
    if (!isValidFileType) {
      return NextResponse.json(
        { error: 'Το περιεχόμενο του αρχείου δεν ταιριάζει με τον δηλωμένο τύπο' },
        { status: 400 }
      )
    }

    // Generate a safe filename to prevent path traversal
    const safeFilename = getSafeFilename(file.name)
    const uploadsDir = path.join(process.cwd(), 'public/uploads')

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = path.join(uploadsDir, safeFilename)

    try {
      // Write the file to disk
      await writeFile(filepath, buffer)
      
      // Verify the file was written correctly by checking if it exists
      if (!existsSync(filepath)) {
        throw new Error('File verification failed: File does not exist after writing')
      }
      
      // Optional: Check file size matches expected size
      const stats = await stat(filepath)
      if (stats.size !== buffer.length) {
        throw new Error(`File verification failed: Size mismatch (expected ${buffer.length}, got ${stats.size})`)
      }
    } catch (error) {
      console.error('Error writing file:', error)
      return NextResponse.json(
        { error: 'Αποτυχία αποθήκευσης αρχείου' },
        { status: 500 }
      )
    }

    // Return success response with the filename
    return NextResponse.json({ 
      success: true,
      filename: `/uploads/${safeFilename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Σφάλμα κατά την αποστολή του αρχείου' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit - 5 deletes per minute per IP
    try {
      await limiter.check(5, `DELETE_UPLOAD_${ip}`)
    } catch {
      return NextResponse.json(
        { error: 'Πάρα πολλές προσπάθειες διαγραφής. Παρακαλώ δοκιμάστε αργότερα.' },
        { status: 429 }
      )
    }

    // Parse the request body to get the filename
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Μη έγκυρο αίτημα JSON' },
        { status: 400 }
      );
    }

    const { filename } = body;

    // Check if filename is provided
    if (!filename) {
      return NextResponse.json(
        { error: 'Δεν δόθηκε όνομα αρχείου' },
        { status: 400 }
      )
    }

    // Security checks to prevent directory traversal
    const normalizedFilename = path.normalize(filename).replace(/^\/+/, '')
    
    // Extra security: ensure the file is in the uploads directory and has a valid format
    // Only allow profile images with our specific naming pattern
    if (!normalizedFilename.startsWith('uploads/') || 
        !normalizedFilename.match(/^uploads\/profile-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp)$/i)) {
      console.warn('Invalid file deletion attempt:', normalizedFilename)
      return NextResponse.json(
        { error: 'Μη έγκυρη διαδρομή αρχείου' },
        { status: 400 }
      )
    }

    const filepath = path.join(process.cwd(), 'public', normalizedFilename)

    // Check if file exists before attempting to delete
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Το αρχείο δεν βρέθηκε' },
        { status: 404 }
      )
    }

    try {
      // Delete the file
      await unlink(filepath)
      
      // Verify the file was actually deleted
      if (existsSync(filepath)) {
        throw new Error('File still exists after deletion attempt')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Αποτυχία διαγραφής αρχείου' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Το αρχείο διαγράφηκε επιτυχώς' 
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη διαγραφή του αρχείου' },
      { status: 500 }
    )
  }
}