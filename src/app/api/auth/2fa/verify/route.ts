// src/app/api/auth/2fa/verify/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verify2FAToken } from '@/lib/auth/2fa';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { validateBody } from '@/lib/utils/validate';
import { applyRateLimit } from '@/lib/utils/rate-limit';

const verify2FALoginSchema = z.object({
  userId: z.string().uuid(),
  token: z.string().min(6).max(8), // 6 digits for TOTP, 8 for backup codes
});

export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for login attempts
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.success) {
      return rateLimitResult.response || Response.json(
        { error: 'Too many verification attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // Validate request body
    const validation = await validateBody(request, verify2FALoginSchema);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request data', details: validation.error?.details },
        { status: 400 }
      );
    }

    const { userId, token } = validation.data!;

    // Verify the 2FA token
    const verificationResult = await verify2FAToken(userId, token);

    if (!verificationResult.isValid) {
      return Response.json(
        { error: 'Invalid authentication code. Please try again.' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      backupCodeUsed: verificationResult.backupCodeUsed || false,
      message: verificationResult.backupCodeUsed 
        ? 'Successfully authenticated using backup code. Consider regenerating your backup codes.'
        : 'Successfully authenticated.',
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}