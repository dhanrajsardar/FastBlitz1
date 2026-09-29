import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies()

  // If the env vars are missing, we mock authentication for sandbox dev mode.
  // BUT we still want the matcher to work.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { }
        },
      },
    }
  );

  let isAuthenticated = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data: { session } } = await supabase.auth.getSession();
    isAuthenticated = !!session;
  } else {
    // Dev fallback if no real supabase is set
    isAuthenticated = true;
  }

  // API Route protection
  if (pathname.startsWith('/api/blitz') && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Frontend Route protection
  if (pathname.startsWith('/blitz') && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/login') && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/blitz';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blitz/:path*', '/api/blitz/:path*', '/login'],
};
