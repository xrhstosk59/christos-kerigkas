// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { contactMessagesRepository } from '@/lib/db'

// Create limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, // Max 10 users per minute
})

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message is too short').max(1000, 'Message is too long'),
})

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    try {
      await limiter.check(5, `CONTACT_FORM_${ip}`) // 5 requests per minute per IP
    } catch {
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Get and validate data
    const body = await req.json()
    const validationResult = contactSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid form data', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const { name, email, message } = validationResult.data

    // Store in database
    await contactMessagesRepository.create({
      name,
      email,
      message,
      ipAddress: typeof ip === 'string' ? ip : ip[0]
    })

    // Create email transporter
    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form Message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    )
  }
}