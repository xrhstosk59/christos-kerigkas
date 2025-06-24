// src/app/api/auth/2fa/verify-setup/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verify2FASetup } from '@/lib/auth/2fa';
import { requireAuth } from '@/lib/auth/authorization';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { validateBody } from '@/lib/utils/validate';
import { applyRateLimit } from '@/lib/utils/rate-limit';

const verify2FASchema = z.object({
  userId: z.string().uuid(),
  token: z.string().length(6, 'Token must be 6 digits'),
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
    const validation = await validateBody(request, verify2FASchema);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request data', details: validation.error?.details },
        { status: 400 }
      );
    }

    const { userId, token } = validation.data!;

    // Verify user can setup 2FA for this account
    if (user.id !== userId) {
      return Response.json(
        { error: 'Unauthorized to verify 2FA for this user' },
        { status: 403 }
      );
    }

    // Verify the 2FA token and enable if valid
    const isValid = await verify2FASetup(userId, token);

    if (!isValid) {
      return Response.json(
        { error: 'Invalid verification code. Please check your authenticator app and try again.' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Two-factor authentication has been successfully enabled.',
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}