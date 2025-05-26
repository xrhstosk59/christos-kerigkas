// src/middleware.ts - FAST & WORKING VERSION
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const essentialHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ✅ Skip static files immediately (HUGE performance boost)
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|css|js|woff|woff2|ttf|eot|pdf)$/i)) {
    return NextResponse.next()
  }

  // ✅ Skip public paths (no processing needed)
  if (pathname === '/' || 
      pathname.startsWith('/blog') || 
      pathname.startsWith('/cv') || 
      pathname.startsWith('/trading-dashboard') ||
      pathname === '/admin/login') {
    return NextResponse.next()
  }

  // ✅ Update session (essential for auth)
  const response = await updateSession(request)
  
  // ✅ Add minimal security headers
  Object.entries(essentialHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // ✅ Simple admin protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // ✅ Simple cache headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store')
  } else if (pathname.startsWith('/uploads/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',],
}