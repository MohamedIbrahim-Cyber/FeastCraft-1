import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createApp, resetStores } from '../../server';
import type { Server } from 'http';

describe('Integration Tests: Admin & Staff Authentication (POST /api/auth/login)', () => {
  let app: ReturnType<typeof createApp>;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetStores();
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  describe('1. Valid Admin & Staff Authentication Flow', () => {
    it('authenticates admin successfully with valid credentials and sets session cookies', async () => {
      const loginPayload = {
        email: 'admin@cyberdev.me',
        password: 'ChefOmar@2026!',
      };

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'admin.cyberdev.me',
        },
        body: JSON.stringify(loginPayload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify payload response
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@cyberdev.me');
      expect(data.user.role).toBe('ADMIN');
      expect(data.user.name).toBe('Chef Omar');
      expect(data.token).toBeDefined();

      // Verify session cookie is set in headers
      const setCookieHeader = res.headers.get('set-cookie') || '';
      expect(setCookieHeader).toContain('next-auth.session-token=');
      expect(setCookieHeader.toLowerCase()).toContain('httponly');
      expect(setCookieHeader.toLowerCase()).toContain('path=/');
    });

    it('authenticates kitchen staff member and sets staff session token', async () => {
      const loginPayload = {
        email: 'staff@cyberdev.me',
        password: 'Staff@FeastCraft2026!',
      };

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'admin.cyberdev.me',
        },
        body: JSON.stringify(loginPayload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.user.email).toBe('staff@cyberdev.me');
      expect(data.user.role).toBe('STAFF');
      expect(data.token).toBeDefined();

      const setCookieHeader = res.headers.get('set-cookie') || '';
      expect(setCookieHeader).toContain('next-auth.session-token=');
    });

    it('retrieves valid session details when providing the session cookie to /api/auth/session', async () => {
      // Step 1: Sign in as admin
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@cyberdev.me',
          password: 'ChefOmar@2026!',
        }),
      });

      expect(loginRes.status).toBe(200);
      const loginData = await loginRes.json();
      const token = loginData.token;

      // Step 2: Query session endpoint using cookie
      const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
        method: 'GET',
        headers: {
          Cookie: `next-auth.session-token=${token}`,
        },
      });

      expect(sessionRes.status).toBe(200);
      const sessionData = await sessionRes.json();
      expect(sessionData.user).toBeDefined();
      expect(sessionData.user.email).toBe('admin@cyberdev.me');
      expect(sessionData.user.role).toBe('ADMIN');
      expect(sessionData.user.name).toBe('Chef Omar');
      expect(sessionData.expires).toBeDefined();
    });
  });

  describe('2. Invalid Credentials & Security Edge Cases', () => {
    it('rejects invalid password with 401 Unauthorized and does not issue a session', async () => {
      const invalidPayload = {
        email: 'admin@cyberdev.me',
        password: 'WrongPassword123!',
      };

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.token).toBeUndefined();
    });

    it('rejects non-existent administrative account with 401 Unauthorized', async () => {
      const nonExistentPayload = {
        email: 'fake.hacker@evil.com',
        password: 'Password@123',
      };

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nonExistentPayload),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('returns 400 Bad Request when email or password field is missing', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@cyberdev.me' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });
  });

  describe('3. Session Teardown & Logout Flow', () => {
    it('clears session cookies on /api/auth/logout', async () => {
      const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(logoutRes.status).toBe(200);
      const data = await logoutRes.json();
      expect(data.success).toBe(true);

      const setCookieHeader = logoutRes.headers.get('set-cookie') || '';
      expect(setCookieHeader).toContain('next-auth.session-token=;');
    });
  });
});
