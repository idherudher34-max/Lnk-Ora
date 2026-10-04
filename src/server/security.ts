/**
 * Linkora Security Engine
 * SSRF validation, rate limiting, and input sanitization.
 */

import { Request, Response, NextFunction } from 'express';

// Private IP checks for SSRF protection
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'metadata',
]);

export function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  const ipv4Parts = ip.split('.').map(Number);
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = ipv4Parts;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-local / AWS/GCP metadata)
    if (a === 169 && b === 254) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (Reserved)
    if (a >= 240) return true;
  }

  // IPv6 checks
  const lower = ip.toLowerCase();
  if (
    lower === '::1' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    lower.startsWith('fd00:') ||
    lower === '::'
  ) {
    return true;
  }

  return false;
}

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  parsedUrl?: URL;
}

export function validateTargetUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Please provide a valid URL.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum allowable length of 2048 characters.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please include http:// or https://.' };
  }

  // Enforce http / https protocols only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: `Protocol '${parsed.protocol}' is not allowed. Only HTTP and HTTPS are supported.`,
    };
  }

  // Disallow user credentials in URL
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'URLs containing embedded credentials are not permitted for security reasons.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block known internal hostnames
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      valid: false,
      error: 'Access to private or local network hosts is prohibited.',
    };
  }

  // Check if hostname is directly an IP
  if (isPrivateIp(hostname)) {
    return {
      valid: false,
      error: 'Access to private, loopback, or cloud-metadata IP ranges is prohibited.',
    };
  }

  return { valid: true, parsedUrl: parsed };
}

export function sanitizeFilename(name: string, fallback = 'media'): string {
  if (!name) return fallback;
  // Remove dangerous path traversals and control characters
  let clean = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.\.+/g, '')
    .trim();
  if (!clean || clean.length === 0) {
    clean = fallback;
  }
  // Max 80 chars
  return clean.substring(0, 80);
}

// In-Memory Rate Limiting
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Periodic cleanup of stale rate limits
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const { windowMs, maxRequests, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    let bucket = rateLimitStore.get(clientIp);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(clientIp, bucket);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      next();
      return;
    }

    bucket.count += 1;
    const remaining = Math.max(0, maxRequests - bucket.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (bucket.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        error:
          message ||
          `Rate limit exceeded. Please wait ${retryAfterSeconds} second(s) before trying again.`,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    next();
  };
}
