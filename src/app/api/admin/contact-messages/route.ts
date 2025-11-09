// src/app/api/admin/contact-messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import type { Database } from '@/lib/db/database.types';

export const dynamic = 'force-dynamic';

type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

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

    // Build base query with count
    let query = db.from('contact_messages').select('*', { count: 'exact' });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get messages with pagination
    const { data: messages, error, count: totalCount } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching contact messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
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
    const updateData: Partial<ContactMessage> = {
      status,
    };

    if (status === 'responded') {
      updateData.responded_at = new Date().toISOString();
      updateData.responded_by_id = authResult.user.id;
    } else {
      updateData.responded_at = null;
      updateData.responded_by_id = null;
    }

    const { data: updatedMessage, error } = await db
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
      console.error('Error updating contact message:', error);
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: updatedMessage,
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
