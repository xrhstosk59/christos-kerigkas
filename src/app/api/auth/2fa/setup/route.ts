// src/app/api/auth/2fa/setup/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generate2FASecret } from '@/lib/auth/2fa';
import { requireAuth } from '@/lib/auth/authorization';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { validateBody } from '@/lib/utils/validate';
import { applyRateLimit } from '@/lib/utils/rate-limit';

const setup2FASchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.success) {
      return rateLimitResult.response || Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication check
    const user = await requireAuth();

    // Validate request body
    const validation = await validateBody(request, setup2FASchema);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request data', details: validation.error?.details },
        { status: 400 }
      );
    }

    const { userId, userEmail } = validation.data!;

    // Verify user can setup 2FA for this account
    if (user.id !== userId) {
      return Response.json(
        { error: 'Unauthorized to setup 2FA for this user' },
        { status: 403 }
      );
    }

    // Generate 2FA setup data
    const setupData = await generate2FASecret(userId, userEmail);

    return Response.json({
      secret: setupData.secret,
      qrCodeUrl: setupData.qrCodeUrl,
      backupCodes: setupData.backupCodes,
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}