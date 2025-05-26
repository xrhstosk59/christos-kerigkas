// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db-client';

// ✅ FORCE DYNAMIC RENDERING - Prevents caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    // ✅ ADD CORS HEADERS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    const db = await getDbClient();
    
    // ✅ DYNAMIC IMPORT TO AVOID CIRCULAR DEPENDENCIES
    const { certifications } = await import('@/lib/db/schema');
    
    // ✅ FIXED: Use correct field name 'issueDate' instead of 'date_issued'
    const result = await db
      .select()
      .from(certifications)
      .orderBy(certifications.issueDate)
      .catch((error) => {
        console.error('Database query error:', error);
        throw new Error('Failed to query certifications');
      });
    
    // ✅ VALIDATE RESULT
    if (!Array.isArray(result)) {
      throw new Error('Invalid data format from database');
    }
    
    console.log(`Successfully fetched ${result.length} certifications`);
    
    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders,
    });
    
  } catch (error) {
    console.error('Certifications API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch certifications',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDbClient();
    const { certifications } = await import('@/lib/db/schema');
    
    // ✅ VALIDATE REQUIRED FIELDS
    if (!body.id || !body.title || !body.issuer || !body.filename || !body.type) {
      return NextResponse.json(
        { error: 'Required fields: id, title, issuer, filename, type' },
        { status: 400 }
      );
    }
    
    // ✅ VALIDATE issueDate if provided
    let issueDate: Date;
    if (body.issueDate) {
      issueDate = new Date(body.issueDate);
      if (isNaN(issueDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid issueDate format' },
          { status: 400 }
        );
      }
    } else {
      issueDate = new Date(); // Default to current date
    }
    
    // ✅ FIXED: Use correct field names matching the schema
    const result = await db
      .insert(certifications)
      .values({
        id: body.id,
        title: body.title,
        issuer: body.issuer,
        issueDate: issueDate,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        credentialId: body.credentialId || null,
        credentialUrl: body.credentialUrl || null,
        description: body.description || null,
        skills: body.skills || [],
        type: body.type,
        filename: body.filename,
        featured: body.featured || false,
      })
      .returning();
    
    return NextResponse.json(result[0], { status: 201 });
    
  } catch (error) {
    console.error('Create certification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create certification',
        message: error instanceof Error ? error.message : 'Database error'
      },
      { status: 500 }
    );
  }
}

// ✅ HANDLE OPTIONS REQUEST (CORS)
export async function OPTIONS(_request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}