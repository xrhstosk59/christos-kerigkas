// src/app/api/admin/contact-messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db-client';
import { contactMessages } from '@/lib/db/schema/contact';
import { desc, eq, count } from 'drizzle-orm';
import { checkAdminAuth } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const authResult = await checkAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDbClient();
    
    // Get URL parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'new', 'responded', etc.
    const offset = (page - 1) * limit;

    // Build base query
    let whereCondition = undefined;
    if (status && status !== 'all') {
      whereCondition = eq(contactMessages.status, status);
    }
    
    // Get total count for pagination
    const totalCountQuery = whereCondition 
      ? db.select({ count: count() }).from(contactMessages).where(whereCondition)
      : db.select({ count: count() }).from(contactMessages);
    const totalCount = await totalCountQuery;
    
    // Get paginated results
    const baseQuery = db.select().from(contactMessages);
    const messagesQuery = whereCondition 
      ? baseQuery.where(whereCondition)
      : baseQuery;
    
    const messages = await messagesQuery
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const authResult = await checkAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const db = await getDbClient();
    
    // Update message status
    const updatedMessage = await db
      .update(contactMessages)
      .set({ 
        status,
        respondedAt: status === 'responded' ? new Date() : null,
        respondedById: status === 'responded' ? authResult.user.id : null
      })
      .where(eq(contactMessages.id, id))
      .returning();

    if (updatedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: updatedMessage[0],
      success: true
    });

  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}