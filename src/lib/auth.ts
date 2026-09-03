import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface UserSessionPayload {
  sub?: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  iat?: number;
  exp?: number;
}

export interface NextAuthSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
    phone?: string | null;
    image?: string | null;
  };
  expires: string;
}

export interface NextAuthToken {
  id?: string;
  sub?: string;
  role?: UserRole;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  [key: string]: any;
}

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'feastcraft-production-secure-auth-secret-key-2026-xyz!';

const JWT_EXPIRES_IN = '7d';

/**
 * Hash password securely with Bcrypt (Salt rounds 10/12)
 */
export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

/**
 * Verify password securely against Bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  try {
    if (!plainText || !hash) return false;
    return await bcrypt.compare(plainText, hash);
  } catch {
    return false;
  }
}

/**
 * In-memory secure runtime credentials registry (seeded + dynamic registrations)
 */
interface StoredUserRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  role: UserRole;
}

const RUNTIME_USERS_STORE = new Map<string, StoredUserRecord>();

// Pre-populate with default staff and customer accounts
const defaultAdminHash = bcrypt.hashSync('ChefOmar@2026!', 10);
const defaultStaffHash = bcrypt.hashSync('Staff@FeastCraft2026!', 10);
const defaultCustomerHash = bcrypt.hashSync('Customer@2026!', 10);

const INITIAL_USERS: StoredUserRecord[] = [
  {
    id: 'user_admin_omar',
    name: 'Chef Omar',
    email: 'admin@cyberdev.me',
    phone: '+20 100 000 0001',
    passwordHash: defaultAdminHash,
    role: 'ADMIN',
  },
  {
    id: 'user_admin_feastcraft',
    name: 'Chef Omar',
    email: 'admin@feastcraft.com',
    phone: '+20 100 000 0001',
    passwordHash: defaultAdminHash,
    role: 'ADMIN',
  },
  {
    id: 'user_staff_kds',
    name: 'Kitchen Expediter (KDS)',
    email: 'staff@cyberdev.me',
    phone: '+20 100 000 0002',
    passwordHash: defaultStaffHash,
    role: 'STAFF',
  },
  {
    id: 'user_customer_karim',
    name: 'Karim Mansour',
    email: 'karim@mansour.com',
    phone: '+20 100 293 8472',
    passwordHash: defaultCustomerHash,
    role: 'CUSTOMER',
  },
];

for (const u of INITIAL_USERS) {
  if (u.email) RUNTIME_USERS_STORE.set(u.email.toLowerCase(), u);
  if (u.phone) RUNTIME_USERS_STORE.set(u.phone.trim(), u);
}

/**
 * Core Credentials Authentication with Role-Based Domain Isolation
 */
export async function authenticateCredentials(
  emailOrPhone: string,
  password: string,
  hostname?: string
): Promise<{ success: boolean; session?: UserSessionPayload; token?: string; error?: string }> {
  if (!emailOrPhone || !password) {
    return { success: false, error: 'Email/phone and password are required.' };
  }

  const normalizedIdentifier = emailOrPhone.toLowerCase().trim();
  const isAdminDomain =
    hostname?.startsWith('admin.') ||
    hostname?.includes('admin.cyberdev.me') ||
    hostname?.includes('admin.localhost');

  // 1. Check in-memory runtime registry (fast and zero-latency)
  const localUser =
    RUNTIME_USERS_STORE.get(normalizedIdentifier) ||
    RUNTIME_USERS_STORE.get(emailOrPhone.trim());

  if (localUser) {
    const isPasswordValid = await verifyPassword(password, localUser.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials provided.' };
    }

    // Role-based portal separation
    if (isAdminDomain && localUser.role === 'CUSTOMER') {
      return {
        success: false,
        error: 'Access Denied: Customer accounts cannot access the administrative portal.',
      };
    }

    const payload: UserSessionPayload = {
      sub: localUser.id,
      id: localUser.id,
      email: localUser.email || normalizedIdentifier,
      name: localUser.name,
      role: localUser.role,
      phone: localUser.phone,
    };

    const token = signSessionJwt(payload);
    return { success: true, session: payload, token };
  }

  // 2. Query Database via Prisma safely with graceful error isolation
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { phone: emailOrPhone.trim() },
        ],
      },
    });

    if (user) {
      if (!user.passwordHash) {
        return {
          success: false,
          error: 'Account was registered as guest. Please set a password or use guest checkout.',
        };
      }

      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // Domain separation checks
      if (isAdminDomain && user.role === Role.CUSTOMER) {
        return {
          success: false,
          error: 'Access Denied: Customer accounts are strictly prohibited from admin portal access.',
        };
      }

      const payload: UserSessionPayload = {
        sub: user.id,
        id: user.id,
        email: user.email || normalizedIdentifier,
        name: user.name || 'Valued Guest',
        role: user.role as UserRole,
        phone: user.phone,
      };

      const token = signSessionJwt(payload);
      return { success: true, session: payload, token };
    }
  } catch {
    // Database connection silent fallback
  }

  return { success: false, error: 'Invalid authentication credentials.' };
}

/**
 * Register a new Customer with self-hosted password hashing
 */
export async function registerCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}): Promise<{ success: boolean; user?: UserSessionPayload; token?: string; error?: string }> {
  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const passwordHash = await hashPassword(data.password);
  const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null;
  const phone = data.phone ? data.phone.trim() : null;

  // Check in-memory uniqueness
  if (normalizedEmail && RUNTIME_USERS_STORE.has(normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  if (phone && RUNTIME_USERS_STORE.has(phone)) {
    return { success: false, error: 'An account with this phone number already exists.' };
  }

  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storedUser: StoredUserRecord = {
    id: newUserId,
    name: data.name,
    email: normalizedEmail,
    phone,
    passwordHash,
    role: 'CUSTOMER',
  };

  if (normalizedEmail) RUNTIME_USERS_STORE.set(normalizedEmail, storedUser);
  if (phone) RUNTIME_USERS_STORE.set(phone, storedUser);

  try {
    await prisma.user.create({
      data: {
        id: newUserId,
        name: data.name,
        email: normalizedEmail,
        phone,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });
  } catch {
    // Stored in in-memory registry
  }

  const payload: UserSessionPayload = {
    sub: newUserId,
    id: newUserId,
    email: normalizedEmail || '',
    name: data.name,
    role: 'CUSTOMER',
    phone,
  };

  const token = signSessionJwt(payload);
  return { success: true, user: payload, token };
}

/**
 * Generate secure signed JSON Web Token (JWT) with user claims
 */
export function signSessionJwt(payload: Omit<UserSessionPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, NEXTAUTH_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode JWT session token
 */
export function verifySessionJwt(token: string): UserSessionPayload | null {
  try {
    const decoded = jwt.verify(token, NEXTAUTH_SECRET, { algorithms: ['HS256'] }) as UserSessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * NextAuth v5 / Auth.js Compatible Configuration
 */
export const authOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    {
      id: 'credentials',
      name: 'FeastCraft Self-Hosted Credentials',
      type: 'credentials' as const,
      credentials: {
        email: { label: 'Email or Phone', type: 'text', placeholder: 'chef@cyberdev.me' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials: any, req?: any) => {
        if (!credentials?.email || !credentials?.password) return null;
        const host = req?.headers?.host || credentials?.hostname || '';
        const result = await authenticateCredentials(credentials.email, credentials.password, host);
        if (result.success && result.session) {
          return {
            id: result.session.id || result.session.sub,
            name: result.session.name,
            email: result.session.email,
            role: result.session.role,
            phone: result.session.phone,
          };
        }
        return null;
      },
    },
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: NextAuthToken; user?: any }) => {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
      }
      return token;
    },
    session: async ({ session, token }: { session: NextAuthSession; token: NextAuthToken }) => {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=CredentialsSignin',
  },
};

export const authConfig = authOptions;
export default authOptions;
