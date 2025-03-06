// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { createTransport } from 'nodemailer'
import { supabase } from '@/lib/supabase'

// Create limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10,
})

// Form validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    try {
      await limiter.check(3, `NEWSLETTER_${ip}`) // 3 requests per minute per IP
    } catch {
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
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

    // Check if email already exists
    const { data: existingSubscriber, error: queryError } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking if subscriber exists:', queryError)
      return NextResponse.json(
        { message: 'Failed to process subscription' },
        { status: 500 }
      )
    }
    
    // If email already exists, return success (to prevent email harvesting)
    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'Subscription successful' },
        { status: 200 }
      )
    }

    // Store in database
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        subscribed_at: new Date().toISOString(),
        ip_address: typeof ip === 'string' ? ip : ip[0]
      })
    
    if (insertError) {
      console.error('Error inserting subscriber:', insertError)
      return NextResponse.json(
        { message: 'Failed to process subscription' },
        { status: 500 }
      )
    }

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
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}