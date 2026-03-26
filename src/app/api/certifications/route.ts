// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';
import { certifications as fallbackCertifications } from '@/content/certifications';
import type { Certification, CertificationType } from '@/types/certifications';
import { getFilenameFromUrl } from '@/lib/utils/storage';

// ✅ FORCE DYNAMIC RENDERING - Prevents caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CertificationRow = {
  id: string | number;
  title?: string | null;
  name?: string | null;
  issuer?: string | null;
  issue_date?: string | null;
  issueDate?: string | null;
  expiry_date?: string | null;
  expirationDate?: string | null;
  credential_id?: string | null;
  credentialId?: string | null;
  credential_url?: string | null;
  credentialUrl?: string | null;
  description?: string | null;
  skills?: string[] | null;
  type?: string | null;
  filename?: string | null;
  featured?: boolean | null;
};

const VALID_CERTIFICATION_TYPES: CertificationType[] = [
  'course',
  'badge',
  'seminar',
  'conference',
  'certification',
];

function normalizeCertificationType(type: string | null | undefined): CertificationType {
  if (type && VALID_CERTIFICATION_TYPES.includes(type as CertificationType)) {
    return type as CertificationType;
  }

  return 'certification';
}

function normalizeCertification(row: CertificationRow): Certification {
  const normalizedFilename = row.filename
    ? getFilenameFromUrl(row.filename) ?? row.filename
    : '';

  return {
    id: String(row.id),
    title: row.title ?? row.name ?? 'Untitled certification',
    issuer: row.issuer ?? 'Unknown issuer',
    issueDate: row.issueDate ?? row.issue_date ?? new Date().toISOString().slice(0, 10),
    expirationDate: row.expirationDate ?? row.expiry_date ?? undefined,
    credentialId: row.credentialId ?? row.credential_id ?? undefined,
    credentialUrl: row.credentialUrl ?? row.credential_url ?? undefined,
    description: row.description ?? undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    type: normalizeCertificationType(row.type),
    filename: normalizedFilename,
    featured: row.featured ?? false,
  };
}

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
        .order('featured', { ascending: false })
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to query certifications');
      }

      // ✅ VALIDATE RESULT
      if (!Array.isArray(result)) {
        throw new Error('Invalid data format from database');
      }

      const normalizedResult = result.map((row) => normalizeCertification(row as CertificationRow));

      console.log(`Successfully fetched ${normalizedResult.length} certifications`);

      return NextResponse.json(normalizedResult, {
        status: 200,
        headers: corsHeaders,
      });

    } catch (dbError) {
      console.warn('Database unavailable, returning mock data:', dbError);

      return NextResponse.json(fallbackCertifications, {
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
    if (!body.title || !body.issuer || !body.issue_date || !body.type) {
      return NextResponse.json(
        { error: 'Required fields: title, issuer, issue_date, type' },
        { status: 400 }
      );
    }

    // ✅ FIXED: Use correct field names matching the schema
    const { data, error } = await supabase
      .from('certifications')
      .insert({
        id: body.id,
        title: body.title,
        issuer: body.issuer,
        issue_date: body.issue_date,
        expiry_date: body.expiry_date || null,
        credential_id: body.credential_id || null,
        credential_url: body.credential_url || null,
        description: body.description || null,
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
