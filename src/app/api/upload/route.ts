// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/supabase/server';
import { authRateLimit } from '@/lib/utils/rate-limit';
import path from 'path';
import { writeFile } from 'fs/promises';
import { ensureUploadsDir } from '@/lib/utils/ensure-uploads-dir';
import crypto from 'crypto';
import { z } from 'zod';

// Επιτρεπόμενοι τύποι αρχείων
const ALLOWED_FILE_TYPES = {
  // Εικόνες
  'image/jpeg': { extension: '.jpg', maxSize: 2 * 1024 * 1024 },  // 2MB
  'image/png': { extension: '.png', maxSize: 2 * 1024 * 1024 },   // 2MB
  'image/webp': { extension: '.webp', maxSize: 2 * 1024 * 1024 }, // 2MB
  'image/gif': { extension: '.gif', maxSize: 2 * 1024 * 1024 },   // 2MB
  'image/svg+xml': { extension: '.svg', maxSize: 1 * 1024 * 1024 }, // 1MB
  
  // Έγγραφα
  'application/pdf': { extension: '.pdf', maxSize: 5 * 1024 * 1024 }, // 5MB
  'application/msword': { extension: '.doc', maxSize: 5 * 1024 * 1024 }, // 5MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: '.docx', maxSize: 5 * 1024 * 1024 // 5MB
  },
};

// Τύποι υποφακέλων για οργάνωση των uploads
const ALLOWED_UPLOAD_TYPES = ['profile', 'certificate', 'project'] as const;

// Τύπος για τους επιτρεπόμενους φακέλους upload
type UploadType = typeof ALLOWED_UPLOAD_TYPES[number];

// Σχήμα επικύρωσης για τα metadata του αρχείου
const uploadMetadataSchema = z.object({
  type: z.enum(ALLOWED_UPLOAD_TYPES).optional(),
  folder: z.string().optional(),
  allowPublicAccess: z.boolean().default(false).optional(),
  description: z.string().optional(),
});

// Συνάρτηση για έλεγχο ασφάλειας περιεχομένου αρχείου
async function checkFileContent(buffer: Buffer, mimeType: string): Promise<boolean> {
  // Έλεγχος υπογραφής αρχείου για αποτροπή επιθέσεων
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    // JPEG magic number check: ξεκινάει με FF D8 FF
    return buffer.length >= 3 && 
           buffer[0] === 0xFF && 
           buffer[1] === 0xD8 && 
           buffer[2] === 0xFF;
  }
  
  if (mimeType === 'image/png') {
    // PNG magic number check: ξεκινάει με 89 50 4E 47 0D 0A 1A 0A
    return buffer.length >= 8 && 
           buffer[0] === 0x89 && 
           buffer[1] === 0x50 && 
           buffer[2] === 0x4E && 
           buffer[3] === 0x47 && 
           buffer[4] === 0x0D && 
           buffer[5] === 0x0A && 
           buffer[6] === 0x1A && 
           buffer[7] === 0x0A;
  }
  
  if (mimeType === 'application/pdf') {
    // PDF magic number check: ξεκινάει με %PDF-
    return buffer.length >= 5 && 
           buffer[0] === 0x25 && // %
           buffer[1] === 0x50 && // P
           buffer[2] === 0x44 && // D
           buffer[3] === 0x46 && // F
           buffer[4] === 0x2D;   // -
  }
  
  // Για άλλους τύπους αρχείων, μπορούμε να προσθέσουμε επιπλέον ελέγχους
  // Αν δεν υπάρχει συγκεκριμένος έλεγχος, επιστρέφουμε true
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Έλεγχος αυθεντικοποίησης
    const authError = await protectApiRoute(req);
    if (authError) return authError;
    
    // Έλεγχος rate limit - χρησιμοποιούμε το authRateLimit αντί του uploadRateLimit
    const rateLimitResult = await authRateLimit(req);
    
    // Έλεγχος αν το rate limit έχει ξεπεραστεί
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response; // Επιστρέφει 429 Too Many Requests
    }
    
    // Δημιουργία headers για rate limit
    const rateLimitHeaders = rateLimitResult.headers || {};
    
    // Παραλαβή των δεδομένων form
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    // Παραλαβή και επικύρωση των metadata (αν υπάρχουν)
    const typeString = formData.get('type') as string | null;
    const folderString = formData.get('folder') as string | null;
    const allowPublicAccessString = formData.get('allowPublicAccess') as string | null;
    const descriptionString = formData.get('description') as string | null;
    
    // Ασφαλής έλεγχος αν ο typeString είναι έγκυρος UploadType
    let validType: UploadType | undefined = undefined;
    if (typeString && ALLOWED_UPLOAD_TYPES.includes(typeString as UploadType)) {
      validType = typeString as UploadType;
    }
    
    const metadata = uploadMetadataSchema.parse({
      type: validType,
      folder: folderString || undefined,
      allowPublicAccess: allowPublicAccessString === 'true',
      description: descriptionString || undefined,
    });
    
    // Έλεγχος αν υπάρχει αρχείο
    if (!file) {
      return NextResponse.json(
        { error: 'Δεν υπάρχει αρχείο για ανέβασμα' },
        { status: 400 }
      );
    }
    
    // Έλεγχος τύπου αρχείου
    const fileTypeInfo = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    if (!fileTypeInfo) {
      return NextResponse.json(
        { error: 'Μη επιτρεπόμενος τύπος αρχείου', allowedTypes: Object.keys(ALLOWED_FILE_TYPES) },
        { status: 400 }
      );
    }
    
    // Έλεγχος μεγέθους αρχείου
    if (file.size > fileTypeInfo.maxSize) {
      return NextResponse.json(
        { 
          error: 'Το μέγεθος του αρχείου υπερβαίνει το όριο', 
          maxSize: `${Math.round(fileTypeInfo.maxSize / (1024 * 1024))}MB` 
        },
        { status: 400 }
      );
    }
    
    // Μετατροπή του αρχείου σε buffer για έλεγχο περιεχομένου
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Έλεγχος περιεχομένου αρχείου (magic numbers κλπ)
    const isValidContent = await checkFileContent(buffer, file.type);
    if (!isValidContent) {
      return NextResponse.json(
        { error: 'Μη έγκυρο περιεχόμενο αρχείου' },
        { status: 400 }
      );
    }
    
    // Δημιουργία ασφαλούς ονόματος αρχείου
    const fileExtension = fileTypeInfo.extension;
    const randomName = crypto.randomBytes(16).toString('hex');
    const safeFileName = `${randomName}${fileExtension}`;
    
    // Καθορισμός υποφακέλου για αποθήκευση
    let uploadDir = 'uploads';
    
    if (metadata.type) {
      uploadDir = path.join(uploadDir, metadata.type);
    }
    
    if (metadata.folder) {
      // Αποτροπή directory traversal attacks
      const safeFolderName = metadata.folder.replace(/[^a-zA-Z0-9-_]/g, '_');
      uploadDir = path.join(uploadDir, safeFolderName);
    }
    
    // Δημιουργία φακέλου αν δεν υπάρχει
    await ensureUploadsDir(uploadDir);
    
    // Αποθήκευση αρχείου
    const filePath = path.join(process.cwd(), 'public', uploadDir, safeFileName);
    await writeFile(filePath, buffer);
    
    // Υπολογισμός hash για έλεγχο ακεραιότητας
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Δημιουργία public URL
    const fileUrl = `/${uploadDir}/${safeFileName}`;
    
    // Επιστροφή πληροφοριών αρχείου
    return NextResponse.json(
      {
        success: true,
        url: fileUrl,
        fileName: safeFileName,
        originalName: file.name,
        type: file.type,
        size: file.size,
        hash: fileHash,
        meta: {
          type: metadata.type,
          folder: metadata.folder,
          description: metadata.description,
        }
      },
      { 
        status: 200,
        headers: rateLimitHeaders
      }
    );
  } catch (error) {
    console.error('File upload error:', error);
    
    // Ασφαλής χειρισμός errors
    let errorMessage = 'Παρουσιάστηκε απροσδόκητο σφάλμα';
    let status = 500;
    
    if (error instanceof z.ZodError) {
      errorMessage = 'Μη έγκυρα μεταδεδομένα';
      status = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

// GET endpoint για λήψη των επιτρεπόμενων τύπων και ορίων
export async function GET(req: NextRequest) {
  // Έλεγχος αυθεντικοποίησης
  const authError = await protectApiRoute(req);
  if (authError) return authError;
  
  return NextResponse.json({
    allowedTypes: Object.entries(ALLOWED_FILE_TYPES).map(([mimeType, info]) => ({
      mimeType,
      extension: info.extension,
      maxSize: info.maxSize,
      maxSizeFormatted: `${Math.round(info.maxSize / (1024 * 1024))}MB`
    })),
    uploadTypes: ALLOWED_UPLOAD_TYPES,
  }, { status: 200 });
}