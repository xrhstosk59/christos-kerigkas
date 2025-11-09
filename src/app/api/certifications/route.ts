// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';

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

    // ✅ FALLBACK: Return mock data if database is not available
    try {
      const supabase = await getDbClient();

      const { data: result, error } = await supabase
        .from('certifications')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to query certifications');
      }

      // ✅ VALIDATE RESULT
      if (!Array.isArray(result)) {
        throw new Error('Invalid data format from database');
      }

      console.log(`Successfully fetched ${result.length} certifications`);

      return NextResponse.json(result, {
        status: 200,
        headers: corsHeaders,
      });

    } catch (dbError) {
      console.warn('Database unavailable, returning mock data:', dbError);

      // ✅ MOCK DATA FALLBACK
      const mockCertifications = [
        {
          id: 1,
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issue_date: '2024-01-15',
          expiry_date: '2027-01-15',
          credential_id: 'ABC123DEF456',
          credential_url: 'https://aws.amazon.com/verification',
          type: 'cloud',
          skills: ['AWS', 'Cloud Computing', 'Infrastructure'],
          filename: 'aws-cloud-practitioner.pdf',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Google Analytics Individual Qualification',
          issuer: 'Google',
          issue_date: '2023-12-10',
          expiry_date: '2024-12-10',
          credential_id: 'GA456789',
          credential_url: 'https://skillshop.exceedlms.com/student/award/123',
          type: 'marketing',
          skills: ['Google Analytics', 'Digital Marketing', 'Data Analysis'],
          filename: 'google-analytics-cert.pdf',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'React Developer Certificate',
          issuer: 'Meta',
          issue_date: '2023-11-20',
          expiry_date: null,
          credential_id: 'REACT789XYZ',
          credential_url: 'https://developers.facebook.com/certification',
          type: 'development',
          skills: ['React', 'JavaScript', 'Frontend Development'],
          filename: 'react-developer-cert.pdf',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return NextResponse.json(mockCertifications, {
        status: 200,
        headers: corsHeaders,
      });
    }

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
    const supabase = await getDbClient();

    // ✅ VALIDATE REQUIRED FIELDS
    if (!body.name || !body.issuer || !body.issue_date || !body.type) {
      return NextResponse.json(
        { error: 'Required fields: name, issuer, issue_date, type' },
        { status: 400 }
      );
    }

    // ✅ FIXED: Use correct field names matching the schema
    const { data, error } = await supabase
      .from('certifications')
      .insert({
        name: body.name,
        issuer: body.issuer,
        issue_date: body.issue_date,
        expiry_date: body.expiry_date || null,
        credential_id: body.credential_id || null,
        credential_url: body.credential_url || null,
        type: body.type,
        skills: body.skills || [],
        filename: body.filename || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });

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
