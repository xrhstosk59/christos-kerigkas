// src/app/api/contact/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { createTransport, SentMessageInfo } from 'nodemailer'
import { z } from 'zod'
import { contactFormRateLimit } from '@/lib/utils/rate-limit'
import { getDbClient } from '@/lib/db/server-db-client' // Ενημερωμένο import
import { sql } from 'drizzle-orm' // Απευθείας εισαγωγή από drizzle-orm

// Ορισμός τύπου για το αποτέλεσμα του SQL ερωτήματος
type DbQueryResult = {
  id: number;
  [key: string]: unknown;
}

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(2, 'Message is too short').max(1000, 'Message is too long'),
})

export async function POST(req: NextRequest) {
  try {
    console.log('Received contact form submission');
    
    // Έλεγχος rate limit - 5 αιτήματα ανά 10 λεπτά
    const rateLimitResult = await contactFormRateLimit(req);
    
    // Έλεγχος αν το αποτέλεσμα είναι NextResponse (σφάλμα rate limit)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult; // Επιστρέφει 429 Too Many Requests
    }
    
    // Get client IP for logging purposes - με μερική απόκρυψη για ασφάλεια
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Απόκρυψη μέρους της IP για λόγους ιδιωτικότητας
    const maskedIp = typeof ip === 'string' 
      ? ip.split('.').slice(0, 2).join('.') + '.xxx.xxx' 
      : 'unknown';
    
    console.log('Client IP (masked):', maskedIp);
    
    // Get and validate data
    let body;
    try {
      body = await req.json();
      // Ασφαλές logging χωρίς να εμφανίζονται προσωπικά δεδομένα
      console.log('Form data received:', { 
        nameProvided: Boolean(body.name),
        emailProvided: Boolean(body.email),
        messageLength: body.message?.length || 0
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Validation error:', {
        fieldErrors: Object.keys(errors.fieldErrors),
        formErrors: errors.formErrors.length
      });
      return NextResponse.json(
        { message: 'Invalid form data', errors },
        { status: 400 }
      );
    }
    
    const { name, email, message } = validationResult.data;
    // Αποθήκευση πλήρους IP μόνο στη βάση δεδομένων
    const ipAddress = typeof ip === 'string' ? ip : ip?.[0] || 'unknown';
    
    // Variable to track if we stored in database
    let databaseSuccess = false;
    let messageId = null;

    try {
      // Attempt to store in database directly with SQL
      console.log('Saving contact message to database');
      
      // Λήψη του database client με τη νέα μέθοδο
      const dbClient = await getDbClient();
      const result = await dbClient.execute(sql`
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
    } catch (dbError) {
      // Ασφαλές logging του σφάλματος χωρίς να εμφανίζει ευαίσθητα δεδομένα
      console.error('Database error:', dbError instanceof Error ? dbError.message : 'Unknown error');
      // We continue with email sending even if database failed
    }

    try {
      // Check if SMTP settings are configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || 
          !process.env.SMTP_PASS || !process.env.SMTP_FROM || !process.env.CONTACT_EMAIL) {
        console.warn('SMTP settings not fully configured, skipping email sending');
        
        // If we successfully stored in database, we still return success
        if (databaseSuccess) {
          const headers = {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
          };
          
          return NextResponse.json(
            { message: 'Message saved successfully but email notification was not sent', databaseSuccess, emailSent: false },
            { status: 200, headers }
          );
        } else {
          return NextResponse.json(
            { message: 'Failed to process your message. Email configuration is missing.' },
            { status: 500 }
          );
        }
      }

      // Ασφαλές logging των SMTP ρυθμίσεων χωρίς να εμφανίζει ευαίσθητα δεδομένα
      console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'Not set',
        from: process.env.SMTP_FROM ? `${process.env.SMTP_FROM.substring(0, 3)}***` : 'Not set',
        to: process.env.CONTACT_EMAIL ? `${process.env.CONTACT_EMAIL.substring(0, 3)}***` : 'Not set'
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
      });

      console.log('Sending email notification');
      
      // Send email
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_EMAIL,
        subject: `New Contact Form Message from ${name}`,
        text: `
          Name: ${name}
          Email: ${email}
          Message: ${message}
          ${messageId ? `Message ID: ${messageId}` : ''}
          IP: ${maskedIp}
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${messageId ? `<p><strong>Message ID:</strong> ${messageId}</p>` : ''}
          <p><strong>Origin:</strong> ${maskedIp}</p>
        `,
      };
      
      // Προσθήκη timeout στην αποστολή email
      const mailPromise = new Promise<SentMessageInfo>((resolve, reject) => {
        // Set a timeout of 10 seconds
        const timeoutId = setTimeout(() => {
          reject(new Error('Email sending timeout after 10 seconds'));
        }, 10000);
        
        // Attempt to send the email
        transporter.sendMail(mailOptions, (err, info) => {
          clearTimeout(timeoutId);
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
      
      const mailResult = await mailPromise;
      
      console.log('Email sent successfully:', mailResult.messageId);
      
      const headers = {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
      };
      
      return NextResponse.json(
        { 
          message: databaseSuccess 
            ? 'Message sent successfully and saved to database' 
            : 'Message sent successfully but failed to save to database',
          databaseSuccess,
          emailSent: true 
        },
        { status: 200, headers }
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', 
        emailError instanceof Error ? emailError.message : 'Unknown error');
      
      // If we at least stored in database, that's a partial success
      if (databaseSuccess) {
        const headers = {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
        };
        
        return NextResponse.json(
          { message: 'Message saved but email notification failed to send', databaseSuccess, emailSent: false },
          { status: 200, headers }
        );
      } else {
        return NextResponse.json(
          { message: 'Failed to process your message completely.' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Unhandled contact form error:', 
      error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { message: 'Failed to process your message' },
      { status: 500 }
    );
  }
}