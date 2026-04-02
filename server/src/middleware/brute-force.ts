import { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@supermaker/shared";

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

/**
 * Progressive brute-force protection:
 * - 1-3 failed attempts: no penalty (normal typos)
 * - 4-5 failed attempts: 1 minute cooldown
 * - 6-8 failed attempts: 5 minute cooldown
 * - 9+ failed attempts: 30 minute cooldown
 *
 * Successful login resets the counter immediately.
 */
class BruteForceStore {
  private ipAttempts = new Map<string, AttemptRecord>();
  private emailAttempts = new Map<string, AttemptRecord>();

  constructor() {
    // Clean up expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private getBlockDuration(count: number): number {
    if (count <= 3) return 0;
    if (count <= 5) return 1 * 60 * 1000; // 1 minute
    if (count <= 8) return 5 * 60 * 1000; // 5 minutes
    return 30 * 60 * 1000; // 30 minutes
  }

  private formatTimeLeft(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds} segundos`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }

  recordFailure(ip: string, email: string): void {
    this.incrementAttempts(this.ipAttempts, ip);
    this.incrementAttempts(this.emailAttempts, email.toLowerCase());
  }

  recordSuccess(ip: string, email: string): void {
    this.ipAttempts.delete(ip);
    this.emailAttempts.delete(email.toLowerCase());
  }

  isBlocked(ip: string, email: string): { blocked: boolean; retryAfter?: number; message?: string } {
    const ipRecord = this.ipAttempts.get(ip);
    const emailRecord = this.emailAttempts.get(email.toLowerCase());

    // Check IP block
    if (ipRecord?.blockedUntil) {
      const remaining = ipRecord.blockedUntil - Date.now();
      if (remaining > 0) {
        return {
          blocked: true,
          retryAfter: Math.ceil(remaining / 1000),
          message: `Demasiados intentos. Intenta de nuevo en ${this.formatTimeLeft(remaining)}.`,
        };
      }
      // Block expired, keep count but clear block
      ipRecord.blockedUntil = null;
    }

    // Check email block (distributed attack protection)
    if (emailRecord?.blockedUntil) {
      const remaining = emailRecord.blockedUntil - Date.now();
      if (remaining > 0) {
        return {
          blocked: true,
          retryAfter: Math.ceil(remaining / 1000),
          message: `Demasiados intentos para esta cuenta. Intenta de nuevo en ${this.formatTimeLeft(remaining)}.`,
        };
      }
      emailRecord.blockedUntil = null;
    }

    return { blocked: false };
  }

  private incrementAttempts(map: Map<string, AttemptRecord>, key: string): void {
    const now = Date.now();
    const record = map.get(key);

    if (!record) {
      map.set(key, { count: 1, firstAttempt: now, blockedUntil: null });
      return;
    }

    // Reset if first attempt was more than 1 hour ago (sliding window)
    if (now - record.firstAttempt > 60 * 60 * 1000) {
      map.set(key, { count: 1, firstAttempt: now, blockedUntil: null });
      return;
    }

    record.count++;
    const blockDuration = this.getBlockDuration(record.count);
    if (blockDuration > 0) {
      record.blockedUntil = now + blockDuration;
      console.warn(
        `[BRUTE-FORCE] Blocked ${key} for ${blockDuration / 1000}s after ${record.count} failed attempts`,
      );
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, record] of this.ipAttempts) {
      if (now - record.firstAttempt > maxAge && (!record.blockedUntil || record.blockedUntil < now)) {
        this.ipAttempts.delete(key);
      }
    }
    for (const [key, record] of this.emailAttempts) {
      if (now - record.firstAttempt > maxAge && (!record.blockedUntil || record.blockedUntil < now)) {
        this.emailAttempts.delete(key);
      }
    }
  }
}

export const bruteForceStore = new BruteForceStore();

/**
 * Middleware that checks if the IP/email is currently blocked.
 * Must be applied BEFORE the login controller.
 */
export function bruteForceCheck(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const email = req.body?.email;

  // If no email in body yet (bad request), let it through — Zod will catch it
  if (!email || typeof email !== "string") {
    next();
    return;
  }

  const result = bruteForceStore.isBlocked(ip, email);
  if (result.blocked) {
    res.set("Retry-After", String(result.retryAfter));
    res.status(429).json({
      success: false,
      error: result.message,
    } satisfies ApiResponse);
    return;
  }

  next();
}
