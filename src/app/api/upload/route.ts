// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `profile-${Date.now()}${path.extname(file.name)}`
    const filepath = path.join(process.cwd(), 'public/uploads', filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ 
      success: true,
      filename: `/uploads/${filename}`
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
    const { filename } = await request.json()
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    const filepath = path.join(process.cwd(), 'public', filename)
    await unlink(filepath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Error deleting file' },
      { status: 500 }
    )
  }
}