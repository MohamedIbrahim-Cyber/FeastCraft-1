import { describe, it, expect } from 'vitest';
import { middleware, NextRequestLike } from '../../src/middleware';
import { signSessionJwt } from '../../src/lib/auth';

function createMockRequest({
  url = 'http://localhost:3000/',
  pathname = '/',
  host = 'cyberdev.me',
  token,
  role,
}: {
  url?: string;
  pathname?: string;
  host?: string;
  token?: string;
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}): NextRequestLike {
  let finalToken = token;
  if (!finalToken && role) {
    finalToken = signSessionJwt({
      id: `usr-${role.toLowerCase()}-1`,
      name: `Test ${role}`,
      email: `${role.toLowerCase()}@cyberdev.me`,
      role,
    });
  }

  const headersMap = new Map<string, string>();
  headersMap.set('host', host);
  if (finalToken) {
    headersMap.set('authorization', `Bearer ${finalToken}`);
  }

  const cookiesMap = new Map<string, { value: string }>();
  if (finalToken) {
    cookiesMap.set('next-auth.session-token', { value: finalToken });
  }

  return {
    url,
    nextUrl: {
      pathname,
      hostname: host,
      searchParams: new URLSearchParams(),
    },
    headers: {
      get: (key: string) => headersMap.get(key.toLowerCase()) || null,
    },
    cookies: {
      get: (key: string) => cookiesMap.get(key),
    },
  };
}

describe('Middleware & Domain Stealth Isolation Tests', () => {
  describe('Customer Domain (cyberdev.me / localhost:3000)', () => {
    it('returns hard 404 rewrite on /admin, /kds, or /dashboard with zero leakage of admin routes', async () => {
      const adminRoutes = ['/admin', '/admin/menu', '/kds', '/dashboard', '/stats', '/api/admin/menu'];

      for (const path of adminRoutes) {
        const req = createMockRequest({
          host: 'cyberdev.me',
          pathname: path,
          url: `http://cyberdev.me${path}`,
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(404);
        expect(result?.body).toContain('Not Found');
        expect(result?.body).toContain('does not exist on this domain');
      }
    });

    it('permits public customer catalog access on /menu and / without restriction', async () => {
      const publicCustomerRoutes = ['/', '/menu', '/checkout', '/tracker/ord-123'];

      for (const path of publicCustomerRoutes) {
        const req = createMockRequest({
          host: 'cyberdev.me',
          pathname: path,
          url: `http://cyberdev.me${path}`,
        });

        const result = await middleware(req);
        // undefined return in Edge middleware indicates allow request to proceed (200 OK)
        expect(result).toBeUndefined();
      }
    });

    it('protects customer account routes (/profile, /my-orders) by redirecting unauthenticated users to sign-in modal', async () => {
      const req = createMockRequest({
        host: 'cyberdev.me',
        pathname: '/profile',
        url: 'http://cyberdev.me/profile',
      });

      const result = await middleware(req);
      expect(result).toBeDefined();
      expect(result?.status).toBe(307);
      expect(result?.redirectUrl).toContain('/?auth=signin');
    });
  });

  describe('Admin Operations Portal (admin.cyberdev.me / admin.localhost:3000)', () => {
    it('blocks non-admin users with CUSTOMER role and redirects them to /login with AccessDenied', async () => {
      const protectedAdminRoutes = ['/', '/dashboard', '/kds', '/menu-cms', '/analytics', '/inventory'];

      for (const path of protectedAdminRoutes) {
        const req = createMockRequest({
          host: 'admin.cyberdev.me',
          pathname: path,
          url: `http://admin.cyberdev.me${path}`,
          role: 'CUSTOMER',
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(307);
        expect(result?.redirectUrl).toContain('/login');
        expect(result?.redirectUrl).toContain('error=AccessDenied');
        expect(result?.redirectUrl).toContain(`callbackUrl=${encodeURIComponent(path)}`);
      }
    });

    it('blocks non-admin users (CUSTOMER role) from accessing administrative API endpoints with 401 Unauthorized', async () => {
      const adminApiRoutes = ['/api/admin/menu', '/api/admin/stats', '/api/admin/orders'];

      for (const path of adminApiRoutes) {
        const req = createMockRequest({
          host: 'admin.cyberdev.me',
          pathname: path,
          url: `http://admin.cyberdev.me${path}`,
          role: 'CUSTOMER',
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(401);
        expect(result?.body).toContain('Unauthorized');
        expect(result?.body).toContain('ADMIN_AUTH_REQUIRED');
      }
    });

    it('redirects unauthenticated requests on admin.localhost:3000 (e.g. /dashboard) to /login', async () => {
      const dashboardRoutes = ['/dashboard', '/dashboard/overview', '/dashboard/settings', '/kds', '/'];

      for (const path of dashboardRoutes) {
        const req = createMockRequest({
          host: 'admin.localhost:3000',
          pathname: path,
          url: `http://admin.localhost:3000${path}`,
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(307);
        expect(result?.redirectUrl).toContain('/login');
        expect(result?.redirectUrl).toContain(`callbackUrl=${encodeURIComponent(path)}`);
      }
    });

    it('restricts unauthorized or non-admin roles (e.g., CUSTOMER) from accessing /dashboard on admin.localhost:3000', async () => {
      const dashboardPaths = ['/dashboard', '/dashboard/analytics', '/dashboard/orders', '/kds'];

      for (const path of dashboardPaths) {
        const req = createMockRequest({
          host: 'admin.localhost:3000',
          pathname: path,
          url: `http://admin.localhost:3000${path}`,
          role: 'CUSTOMER',
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(307);
        expect(result?.redirectUrl).toContain('/login');
        expect(result?.redirectUrl).toContain('error=AccessDenied');
        expect(result?.redirectUrl).toContain(`callbackUrl=${encodeURIComponent(path)}`);
      }
    });

    it('allows valid ADMIN and STAFF sessions to access /dashboard routes on admin.localhost:3000', async () => {
      const reqAdmin = createMockRequest({
        host: 'admin.localhost:3000',
        pathname: '/dashboard',
        url: 'http://admin.localhost:3000/dashboard',
        role: 'ADMIN',
      });

      const resultAdmin = await middleware(reqAdmin);
      expect(resultAdmin).toBeUndefined();

      const reqStaff = createMockRequest({
        host: 'admin.localhost:3000',
        pathname: '/dashboard/orders',
        url: 'http://admin.localhost:3000/dashboard/orders',
        role: 'STAFF',
      });

      const resultStaff = await middleware(reqStaff);
      expect(resultStaff).toBeUndefined();
    });

    it('redirects unauthenticated requests to / or /dashboard to /login', async () => {
      const protectedAdminRoutes = ['/', '/dashboard', '/kds', '/menu-cms', '/analytics'];

      for (const path of protectedAdminRoutes) {
        const req = createMockRequest({
          host: 'admin.cyberdev.me',
          pathname: path,
          url: `http://admin.cyberdev.me${path}`,
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(307);
        expect(result?.redirectUrl).toContain('/login');
      }
    });

    it('returns hard 404 for customer ordering paths (/menu, /checkout) on admin portal', async () => {
      const customerRoutes = ['/menu', '/checkout', '/cart', '/tracker', '/customize'];

      for (const path of customerRoutes) {
        const req = createMockRequest({
          host: 'admin.cyberdev.me',
          pathname: path,
          url: `http://admin.cyberdev.me${path}`,
        });

        const result = await middleware(req);
        expect(result).toBeDefined();
        expect(result?.status).toBe(404);
        expect(result?.body).toContain('Customer catalog and ordering routes are not accessible');
      }
    });

    it('allows authenticated ADMIN and STAFF sessions to access / and /kds without redirect', async () => {
      const reqAdmin = createMockRequest({
        host: 'admin.cyberdev.me',
        pathname: '/kds',
        url: 'http://admin.cyberdev.me/kds',
        role: 'ADMIN',
      });

      const resultAdmin = await middleware(reqAdmin);
      expect(resultAdmin).toBeUndefined();

      const reqStaff = createMockRequest({
        host: 'admin.cyberdev.me',
        pathname: '/dashboard',
        url: 'http://admin.cyberdev.me/dashboard',
        role: 'STAFF',
      });

      const resultStaff = await middleware(reqStaff);
      expect(resultStaff).toBeUndefined();
    });

    it('redirects logged-in ADMIN visiting /login back to dashboard /', async () => {
      const req = createMockRequest({
        host: 'admin.cyberdev.me',
        pathname: '/login',
        url: 'http://admin.cyberdev.me/login',
        role: 'ADMIN',
      });

      const result = await middleware(req);
      expect(result).toBeDefined();
      expect(result?.status).toBe(307);
      expect(result?.redirectUrl).toBe('/');
    });
  });
});
