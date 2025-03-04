// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
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
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(16).toString('hex')
  return `profile-${timestamp}-${randomString}${ext}`
}

// Security check for file type
async function verifyFileType(buffer: Buffer, type: string): Promise<boolean> {
  // Check magic numbers for common image formats
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]]
  }

  if (!signatures[type]) return false

  const bytes = Array.from(buffer.slice(0, 12))
  
  return signatures[type].some(signature => 
    signature.every((byte, i) => 
      byte === null || byte === bytes[i]
    )
  )
}

export async function POST(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit - 5 uploads per minute per IP
    try {
      await limiter.check(5, `UPLOAD_${ip}`)
    } catch {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file
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

    // Get file buffer and verify its actual type
    const buffer = Buffer.from(await file.arrayBuffer())
    const isValidFileType = await verifyFileType(buffer, file.type)
    
    if (!isValidFileType) {
      return NextResponse.json(
        { error: 'File content does not match the declared type' },
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
      await writeFile(filepath, buffer)
    } catch (error) {
      console.error('Error writing file:', error)
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      filename: `/uploads/${safeFilename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit - 5 deletes per minute per IP
    try {
      await limiter.check(5, `DELETE_UPLOAD_${ip}`)
    } catch {
      return NextResponse.json(
        { error: 'Too many delete attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    // Security checks to prevent directory traversal
    const normalizedFilename = path.normalize(filename).replace(/^\/+/, '')
    
    // Extra security: ensure the file is in the uploads directory and has a valid extension
    if (!normalizedFilename.startsWith('uploads/') || 
        !normalizedFilename.match(/^uploads\/profile-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    const filepath = path.join(process.cwd(), 'public', normalizedFilename)

    try {
      await unlink(filepath)
    } catch (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Error deleting file' },
      { status: 500 }
    )
  }
}