import { NextResponse } from 'next/server';
import { getCertifications } from '@/lib/content';
import { getCertificateUrl } from '@/lib/utils/storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  const normalized = getCertifications().map((certification) => ({
    ...certification,
    filename: certification.filename ? getCertificateUrl(certification.filename) : '',
  }));

  return NextResponse.json(normalized, {
    headers: { ...corsHeaders, 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
