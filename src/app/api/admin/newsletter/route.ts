// src/app/api/admin/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db-client';
import { newsletterSubscribers } from '@/lib/db/schema/contact';
import { desc, eq, count, like, and, sql } from 'drizzle-orm';
import { checkAdminAuth } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

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

    // Build where conditions
    const whereConditions = [];
    
    if (status === 'active') {
      whereConditions.push(eq(newsletterSubscribers.isActive, true));
    } else if (status === 'unsubscribed') {
      whereConditions.push(eq(newsletterSubscribers.isActive, false));
    }
    
    if (search) {
      whereConditions.push(like(newsletterSubscribers.email, `%${search}%`));
    }

    const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Get total count for pagination
    const totalCountQuery = whereCondition 
      ? db.select({ count: count() }).from(newsletterSubscribers).where(whereCondition)
      : db.select({ count: count() }).from(newsletterSubscribers);
    const totalCount = await totalCountQuery;
    
    // Get paginated results
    const baseQuery = db.select().from(newsletterSubscribers);
    const subscribersQuery = whereCondition 
      ? baseQuery.where(whereCondition)
      : baseQuery;
    
    const subscribers = await subscribersQuery
      .orderBy(desc(newsletterSubscribers.subscribedAt))
      .limit(limit)
      .offset(offset);

    // Get statistics
    const stats = await db
      .select({
        totalSubscribers: sql<number>`count(*)`,
        activeSubscribers: sql<number>`count(*) filter (where ${newsletterSubscribers.isActive} = true)`,
        unsubscribedCount: sql<number>`count(*) filter (where ${newsletterSubscribers.isActive} = false)`,
        recentSubscriptions: sql<number>`count(*) filter (where ${newsletterSubscribers.subscribedAt} > current_date - interval '7 days')`,
      })
      .from(newsletterSubscribers);

    return NextResponse.json({
      subscribers,
      statistics: stats[0],
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
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
      const deletedSubscriber = await db
        .delete(newsletterSubscribers)
        .where(eq(newsletterSubscribers.id, id))
        .returning();

      if (deletedSubscriber.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        message: 'Subscriber deleted successfully',
        success: true
      });
    } else {
      // Update subscriber status
      const isActive = action === 'activate';
      const updatedSubscriber = await db
        .update(newsletterSubscribers)
        .set({ 
          isActive,
          unsubscribedAt: isActive ? null : new Date()
        })
        .where(eq(newsletterSubscribers.id, id))
        .returning();

      if (updatedSubscriber.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        subscriber: updatedSubscriber[0],
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
    const existingSubscriber = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existingSubscriber.length > 0) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add new subscriber
    const newSubscriber = await db
      .insert(newsletterSubscribers)
      .values({
        email,
        isActive: true,
        ipAddress: 'admin-added'
      })
      .returning();

    return NextResponse.json({ 
      subscriber: newSubscriber[0],
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