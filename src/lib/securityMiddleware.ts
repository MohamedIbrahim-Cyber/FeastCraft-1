import { Request, Response, NextFunction } from 'express';
import { verifySessionJwt, UserSessionPayload, UserRole } from './auth';
import { rateLimit, getClientIp, RATE_LIMITS, recordSecurityAudit } from './rateLimiter';

// Extend Express Request type to include user session
declare global {
  namespace Express {
    interface Request {
      user?: UserSessionPayload;
    }
  }
}

/**
 * 1. Role Enforcement Middleware
 * Protects routes by validating JWT from Authorization header or session cookies.
 * Enforces active role claims.
 */
export function enforceRole(allowedRoles: UserRole[] = ['ADMIN', 'STAFF']) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract Token from Authorization Bearer or Session Cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.cookie) {
      // Parse cookies
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);

      token =
        cookies['__Secure-auth.session-token'] ||
        cookies['authjs.session-token'] ||
        cookies['next-auth.session-token'] ||
        cookies['feastcraft_jwt'];
    }

    // Also allow query token for development testing if present
    if (!token && typeof req.query.auth_token === 'string') {
      token = req.query.auth_token;
    }

    if (!token) {
      recordSecurityAudit(
        'UNAUTHORIZED_ADMIN_ACCESS',
        getClientIp(req),
        req.originalUrl || req.url,
        'Missing authentication token for protected route.'
      );
      return res.status(401).json({
        error: 'Unauthorized: Missing valid session token or authentication credentials.',
        code: 'UNAUTHORIZED',
        requiredRoles: allowedRoles,
      });
    }

    // 2. Cryptographic JWT Verification
    const session = verifySessionJwt(token);
    if (!session) {
      recordSecurityAudit(
        'UNAUTHORIZED_ADMIN_ACCESS',
        getClientIp(req),
        req.originalUrl || req.url,
        'Invalid or expired JWT signature.'
      );
      return res.status(401).json({
        error: 'Unauthorized: Session token is expired, invalid, or forged.',
        code: 'INVALID_TOKEN',
      });
    }

    // 3. Role Claims Check
    if (!allowedRoles.includes(session.role)) {
      recordSecurityAudit(
        'UNAUTHORIZED_ADMIN_ACCESS',
        getClientIp(req),
        req.originalUrl || req.url,
        `Role '${session.role}' attempted to access restricted endpoint requiring [${allowedRoles.join(', ')}].`
      );
      return res.status(403).json({
        error: `Forbidden: Insufficient privileges. Role '${session.role}' is not authorized to access this resource.`,
        code: 'FORBIDDEN',
        userRole: session.role,
        requiredRoles: allowedRoles,
      });
    }

    // Attach verified session to request
    req.user = session;
    next();
  };
}

/**
 * 2. Rate Limiting Middleware Factory
 */
export function createRateLimiterMiddleware(config: {
  limit: number;
  windowSeconds: number;
  name: string;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const routeKey = `${req.baseUrl || ''}${req.path || ''}`;
    const key = `${ip}:${routeKey}`;

    try {
      const result = await rateLimit(key, config.limit, config.windowSeconds);

      // Set standard RFC rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.reset.toString());
      res.setHeader('X-RateLimit-Policy', `${config.limit};w=${config.windowSeconds}`);

      if (!result.success) {
        if (result.retryAfterSeconds) {
          res.setHeader('Retry-After', result.retryAfterSeconds.toString());
        }

        recordSecurityAudit(
          'RATE_LIMIT_TRIGGERED',
          ip,
          routeKey,
          `Triggered ${config.name}. Limit of ${config.limit} requests per ${config.windowSeconds}s reached.`
        );

        return res.status(429).json({
          error: `Too Many Requests: Rate limit exceeded for ${config.name}. Please try again in ${result.retryAfterSeconds || config.windowSeconds} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED',
          limit: result.limit,
          remaining: 0,
          reset: result.reset,
          retryAfter: result.retryAfterSeconds || config.windowSeconds,
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiting middleware error (failing open for resiliency):', err);
      next();
    }
  };
}

/**
 * 3. Client Tamper Proofing Middleware
 * Strips all submitted client monetary fields (e.g. totalAmount, deposit, unitPrice, baseSubtotal)
 * from incoming payloads before reaching business logic.
 */
export function stripPriceFieldsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const forbiddenKeys = [
      'totalAmount',
      'total',
      'deposit',
      'depositRequired',
      'depositPaid',
      'baseSubtotal',
      'discountAmount',
      'discountPercentage',
      'flatFee',
      'unitPrice',
      'price',
    ];

    let foundTamper = false;

    const sanitizeObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (forbiddenKeys.includes(key)) {
          delete obj[key];
          foundTamper = true;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(req.body);

    if (foundTamper) {
      recordSecurityAudit(
        'PRICE_TAMPERING_BLOCKED',
        getClientIp(req),
        req.originalUrl || req.url,
        'Client payload contained forbidden monetary override fields; safely stripped and ignored before pricing engine calculations.'
      );
    }
  }
  next();
}

/**
 * 4. Content Security Policy (CSP) & Hardened HTTP Security Headers Middleware
 * Allows Paymob iframes, Cloudinary images, Google Fonts, and preview iframe framing.
 */
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy (Permissive for iframe previews and external payment/asset integrations)
  const cspDirectives = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accept.paymob.com https://checkout.paymob.com *",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com *",
    "font-src 'self' https://fonts.gstatic.com data: *",
    "img-src 'self' data: blob: https: http: *",
    "frame-src 'self' https://accept.paymob.com https://checkout.paymob.com *",
    "connect-src 'self' ws: wss: https: http: data: blob: https://accept.paymob.com https://checkout.paymob.com *",
    "frame-ancestors *",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent caching of sensitive API endpoints
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
}

/**
 * 5. CSRF Mitigation Middleware
 * Validates custom header or token on state-changing requests (POST, PUT, DELETE, PATCH).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  // Skip webhooks which are verified via HMAC cryptographic signatures
  if (req.path === '/api/webhooks/paymob' || !mutatingMethods.includes(req.method)) {
    return next();
  }

  // Check custom header standard for AJAX / Fetch clients (cannot be set cross-origin without CORS preflight approval)
  const clientHeader =
    req.headers['x-requested-with'] ||
    req.headers['x-csrf-token'] ||
    req.headers['authorization'] ||
    req.headers['content-type']?.includes('application/json');

  if (!clientHeader) {
    return res.status(403).json({
      error: 'CSRF Verification Failed: Missing valid CSRF request header.',
      code: 'CSRF_FAILED',
    });
  }

  next();
}
