// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { newsletterRateLimit } from '@/lib/utils/rate-limit'
import { createTransport } from 'nodemailer'
import { newsletterRepository } from '@/lib/db/repositories/newsletter-repository'

// Form validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: Request) {
  try {
    // Έλεγχος rate limit - 3 αιτήματα ανά ώρα
    const rateLimitResult = await newsletterRateLimit(req);
    
    // Έλεγχος αν το αποτέλεσμα είναι NextResponse (σφάλμα rate limit)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult; // Επιστρέφει 429 Too Many Requests
    }
    
    // Get client IP για καταγραφή
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    // Get and validate data
    const body = await req.json()
    const validationResult = subscribeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid form data', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const { email } = validationResult.data

    // Check if email already exists using repository
    const isSubscribed = await newsletterRepository.isSubscribed(email)
    
    // If email already exists, return success (to prevent email harvesting)
    if (isSubscribed) {
      return NextResponse.json(
        { message: 'Subscription successful' },
        { status: 200, headers: rateLimitResult.headers }
      )
    }

    // Store in database using repository
    const ipAddress = typeof ip === 'string' ? ip : ip[0]
    await newsletterRepository.subscribe({
      email,
      subscribedAt: new Date(),
      ipAddress,
      isActive: true
    })

    // Send confirmation email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
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

        // Send confirmation email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: 'Newsletter Subscription Confirmation',
          text: `
            Thank you for subscribing to the newsletter!
            
            You'll receive updates about new blog posts and other announcements.
            
            If you didn't subscribe, please ignore this email.
          `,
          html: `
            <h3>Thank you for subscribing!</h3>
            <p>You'll receive updates about new blog posts and other announcements.</p>
            <p>If you didn't subscribe, please ignore this email.</p>
          `,
        })
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't return an error to the client since the subscription was successful
      }
    }

    return NextResponse.json(
      { message: 'Subscription successful' },
      { status: 200, headers: rateLimitResult.headers }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    // Get and validate data
    const body = await req.json()
    const { email } = body
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    // Update subscription status using repository
    await newsletterRepository.unsubscribe(email)
    
    return NextResponse.json(
      { message: 'Unsubscribed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { message: 'Failed to process unsubscription' },
      { status: 500 }
    )
  }
}