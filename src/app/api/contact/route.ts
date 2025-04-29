// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { createTransport } from 'nodemailer'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { db, sql } from '@/lib/db'

// Ορισμός τύπου για το αποτέλεσμα του SQL ερωτήματος
type DbQueryResult = {
  id: number;
  [key: string]: unknown;
}

// Create limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, // Max 10 users per minute
})

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(2, 'Message is too short').max(1000, 'Message is too long'),
})

export async function POST(req: Request) {
  try {
    console.log('Received contact form submission');
    
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    console.log('Client IP:', typeof ip === 'string' ? ip : ip?.[0] || 'unknown');
    
    // Check rate limit
    try {
      await limiter.check(5, `CONTACT_FORM_${ip}`) // 5 requests per minute per IP
    } catch (error) {
      console.error('Rate limit exceeded:', error);
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Get and validate data
    let body;
    try {
      body = await req.json()
      console.log('Form data received:', { 
        name: body.name,
        email: body.email,
        messagePreview: body.message?.substring(0, 20) + '...' 
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    const validationResult = contactSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Validation error:', errors);
      return NextResponse.json(
        { message: 'Invalid form data', errors },
        { status: 400 }
      )
    }
    
    const { name, email, message } = validationResult.data
    const ipAddress = typeof ip === 'string' ? ip : ip?.[0] || 'unknown';
    
    // Variable to track if we stored in database
    let databaseSuccess = false;
    let messageId = null;

    try {
      // Attempt to store in database directly with SQL
      if (db) {
        console.log('Saving contact message to database');
        
        const result = await db.execute(sql`
          INSERT INTO contact_messages (name, email, message, ip_address, status, created_at)
          VALUES (${name}, ${email}, ${message}, ${ipAddress}, ${'new'}, NOW())
          RETURNING id
        `);
        
        // Χρήση type assertion για να ορίσουμε τον τύπο του result
        const typedResult = result as unknown as DbQueryResult[];
        
        if (typedResult && typedResult.length > 0 && typedResult[0].id) {
          messageId = typedResult[0].id;
          databaseSuccess = true;
          console.log('Message saved to database with ID:', messageId);
        }
      } else {
        console.warn('Database client not available, skipping database storage');
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // We continue with email sending even if database failed
    }

    try {
      // Check if SMTP settings are configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || 
          !process.env.SMTP_PASS || !process.env.SMTP_FROM || !process.env.CONTACT_EMAIL) {
        console.warn('SMTP settings not fully configured, skipping email sending');
        
        // If we successfully stored in database, we still return success
        if (databaseSuccess) {
          return NextResponse.json(
            { message: 'Message saved successfully but email notification was not sent', databaseSuccess, emailSent: false },
            { status: 200 }
          )
        } else {
          return NextResponse.json(
            { message: 'Failed to process your message. Email configuration is missing.' },
            { status: 500 }
          )
        }
      }

      console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER?.substring(0, 3) + '***',
        from: process.env.SMTP_FROM?.substring(0, 3) + '***',
        to: process.env.CONTACT_EMAIL?.substring(0, 3) + '***'
      });

      // Create email transporter
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465', // Auto determine security based on port
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      console.log('Sending email notification to:', process.env.CONTACT_EMAIL);
      
      // Send email
      const mailResult = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_EMAIL,
        subject: `New Contact Form Message from ${name}`,
        text: `
          Name: ${name}
          Email: ${email}
          Message: ${message}
          ${messageId ? `Message ID: ${messageId}` : ''}
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${messageId ? `<p><strong>Message ID:</strong> ${messageId}</p>` : ''}
        `,
      })

      console.log('Email sent successfully:', mailResult.messageId);
      
      return NextResponse.json(
        { 
          message: databaseSuccess 
            ? 'Message sent successfully and saved to database' 
            : 'Message sent successfully but failed to save to database',
          databaseSuccess,
          emailSent: true 
        },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      
      // If we at least stored in database, that's a partial success
      if (databaseSuccess) {
        return NextResponse.json(
          { message: 'Message saved but email notification failed to send', databaseSuccess, emailSent: false },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          { message: 'Failed to process your message completely.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Unhandled contact form error:', error);
    return NextResponse.json(
      { message: 'Failed to process your message' },
      { status: 500 }
    )
  }
}