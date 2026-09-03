import { verifySessionJwt, UserSessionPayload } from './lib/auth';

export interface NextRequestLike {
  url: string;
  nextUrl?: {
    pathname: string;
    hostname?: string;
    searchParams?: URLSearchParams;
  };
  headers: {
    get: (key: string) => string | null;
  };
  cookies: {
    get: (key: string) => { value: string } | undefined;
  };
}

export interface NextResponseLike {
  status: number;
  headers?: Map<string, string>;
  json?: (body: any, init?: { status?: number }) => any;
  redirect?: (url: string) => any;
  rewrite?: (url: string) => any;
  next?: () => any;
}

/**
 * Next.js Edge Middleware for Role Enforcement, Domain Separation, and Route Protection
 */
export async function middleware(req: NextRequestLike) {
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl?.hostname ||
    '';

  const pathname = req.nextUrl?.pathname || new URL(req.url, 'http://localhost:3000').pathname;

  // Static assets & internal Next.js routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return;
  }

  // Extract JWT token from cookie or authorization header
  const authHeader = req.headers.get('authorization');
  const cookieToken =
    req.cookies.get('__Secure-next-auth.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-auth.session-token')?.value ||
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('feastcraft_token')?.value;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieToken) {
    token = cookieToken;
  }

  const session: UserSessionPayload | null = token ? verifySessionJwt(token) : null;
  const isAdminDomain =
    host.startsWith('admin.') ||
    host.includes('admin.cyberdev.me') ||
    host.includes('admin.localhost');

  // ---------------------------------------------------------------------------
  // Case A: Administrative Portal (admin.cyberdev.me / admin.localhost:3000)
  // ---------------------------------------------------------------------------
  if (isAdminDomain) {
    // 0. Block customer-facing storefront routes on admin portal with 404
    if (
      pathname === '/menu' ||
      pathname.startsWith('/menu/') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/cart') ||
      pathname.startsWith('/tracker') ||
      pathname.startsWith('/customize')
    ) {
      return {
        status: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Customer catalog and ordering routes are not accessible from the operations portal.',
        }),
      };
    }

    // 1. Allow public admin login & auth endpoints
    if (pathname === '/login' || pathname.startsWith('/api/auth')) {
      // If already logged in as ADMIN/STAFF and visiting /login, redirect to dashboard /
      if (pathname === '/login' && session && (session.role === 'ADMIN' || session.role === 'STAFF')) {
        return {
          status: 307,
          redirectUrl: '/',
        };
      }
      return;
    }

    // 2. All operational pages (/, /kds, /dashboard, /stats, /analytics, /api/admin/*) require ADMIN or STAFF
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      if (pathname.startsWith('/api/')) {
        return {
          status: 401,
          body: JSON.stringify({
            error: 'Unauthorized: Administrative credentials required.',
            code: 'ADMIN_AUTH_REQUIRED',
          }),
        };
      }
      // Redirect unauthorized/customer users to /login
      const callbackParam = encodeURIComponent(pathname);
      return {
        status: 307,
        redirectUrl: `/login?callbackUrl=${callbackParam}&error=AccessDenied`,
      };
    }

    return;
  }

  // ---------------------------------------------------------------------------
  // Case B: Consumer Storefront (cyberdev.me / localhost:3000)
  // ---------------------------------------------------------------------------
  // 1. Completely block admin internal endpoints from consumer domain (Return 404 rewrite)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/kds') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/stats') ||
    pathname.startsWith('/api/admin')
  ) {
    return {
      status: 404,
      body: JSON.stringify({
        error: 'Not Found',
        message: 'The requested administrative resource does not exist on this domain.',
      }),
    };
  }

  // 2. Protected customer routes (Profile / Account history)
  if (pathname.startsWith('/profile') || pathname.startsWith('/account') || pathname.startsWith('/my-orders')) {
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return {
          status: 401,
          body: JSON.stringify({ error: 'Customer authentication required' }),
        };
      }
      return {
        status: 307,
        redirectUrl: `/?auth=signin&callbackUrl=${encodeURIComponent(pathname)}`,
      };
    }
  }

  // 3. Customer checkout (/checkout) explicitly supports Guest checkout without forcing authentication
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export default middleware;
