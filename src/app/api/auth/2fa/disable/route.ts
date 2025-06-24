// src/app/api/auth/2fa/disable/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { disable2FA, verify2FAToken } from '@/lib/auth/2fa';
import { requireAuth } from '@/lib/auth/authorization';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { validateBody } from '@/lib/utils/validate';
import { applyRateLimit } from '@/lib/utils/rate-limit';

const disable2FASchema = z.object({
  userId: z.string().uuid(),
  token: z.string().min(6).max(8), // Current 2FA token required for security
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.success) {
      return rateLimitResult.response || Response.json(
        { error: 'Too many disable attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication check
    const user = await requireAuth();

    // Validate request body
    const validation = await validateBody(request, disable2FASchema);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request data', details: validation.error?.details },
        { status: 400 }
      );
    }

    const { userId, token } = validation.data!;

    // Verify user can disable 2FA for this account
    if (user.id !== userId) {
      return Response.json(
        { error: 'Unauthorized to disable 2FA for this user' },
        { status: 403 }
      );
    }

    // Verify current 2FA token before disabling (security measure)
    const verificationResult = await verify2FAToken(userId, token);
    if (!verificationResult.isValid) {
      return Response.json(
        { error: 'Invalid current 2FA token. Please provide a valid token to disable 2FA.' },
        { status: 400 }
      );
    }

    // Disable 2FA
    const success = await disable2FA(userId);
    if (!success) {
      return Response.json(
        { error: 'Failed to disable two-factor authentication. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Two-factor authentication has been successfully disabled.',
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}