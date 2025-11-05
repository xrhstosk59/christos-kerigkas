// src/app/api/admin/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import type { Database } from '@/lib/db/database.types';

export const dynamic = 'force-dynamic';

type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];

// Get newsletter subscribers
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'active', 'unsubscribed', 'all'
    const search = searchParams.get('search'); // Search in email
    const offset = (page - 1) * limit;

    // Build base query
    let query = db.from('newsletter_subscribers').select('*', { count: 'exact' });

    // Apply filters
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'unsubscribed') {
      query = query.eq('is_active', false);
    }

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Get subscribers with pagination
    const { data: subscribers, error, count: totalCount } = await query
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Get statistics
    const { data: allSubscribers, error: statsError } = await db
      .from('newsletter_subscribers')
      .select('*');

    if (statsError) {
      console.error('Error fetching statistics:', statsError);
    }

    const stats = {
      totalSubscribers: allSubscribers?.length || 0,
      activeSubscribers: allSubscribers?.filter(s => s.is_active).length || 0,
      unsubscribedCount: allSubscribers?.filter(s => !s.is_active).length || 0,
      recentSubscriptions: allSubscribers?.filter(s => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(s.subscribed_at) > sevenDaysAgo;
      }).length || 0,
    };

    return NextResponse.json({
      subscribers,
      statistics: stats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manage subscriber status (activate/deactivate)
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
    const { id, action } = body; // action: 'activate', 'deactivate', 'delete'

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action' },
        { status: 400 }
      );
    }

    const db = await getDbClient();

    if (action === 'delete') {
      // Delete subscriber completely
      const { data: deletedSubscriber, error } = await db
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Subscriber not found' },
            { status: 404 }
          );
        }
        console.error('Error deleting subscriber:', error);
        return NextResponse.json(
          { error: 'Failed to delete subscriber' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Subscriber deleted successfully',
        success: true
      });
    } else {
      // Update subscriber status
      const isActive = action === 'activate';
      const updateData: Partial<NewsletterSubscriber> = {
        is_active: isActive,
        unsubscribed_at: isActive ? null : new Date().toISOString()
      };

      const { data: updatedSubscriber, error } = await db
        .from('newsletter_subscribers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Subscriber not found' },
            { status: 404 }
          );
        }
        console.error('Error updating subscriber:', error);
        return NextResponse.json(
          { error: 'Failed to update subscriber' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        subscriber: updatedSubscriber,
        message: `Subscriber ${action}d successfully`,
        success: true
      });
    }

  } catch (error) {
    console.error('Error updating newsletter subscriber:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add new subscriber manually
export async function POST(request: NextRequest) {
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDbClient();

    // Check if subscriber already exists
    const { data: existingSubscriber, error: checkError } = await db
      .from('newsletter_subscribers')
      .select()
      .eq('email', email)
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add new subscriber
    const { data: newSubscriber, error } = await db
      .from('newsletter_subscribers')
      .insert({
        email,
        is_active: true,
        ip_address: 'admin-added'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding subscriber:', error);
      return NextResponse.json(
        { error: 'Failed to add subscriber' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriber: newSubscriber,
      message: 'Subscriber added successfully',
      success: true
    });

  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
