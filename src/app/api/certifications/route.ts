// src/app/api/certifications/route.ts
import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';

export async function GET() {
  try {
    const db = await getDbClient();
    // Δυναμική εισαγωγή του schema για να αποφύγουμε κυκλικές εξαρτήσεις
    const { certifications } = await import('@/lib/db/schema');
    
    // Ανάκτηση των πιστοποιήσεων από τη βάση δεδομένων
    const result = await db.select().from(certifications);
    
    // Επιστροφή των αποτελεσμάτων ως JSON
    return NextResponse.json(result);
  } catch (error) {
    // Καταγραφή του σφάλματος και επιστροφή κατάλληλης απάντησης
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}