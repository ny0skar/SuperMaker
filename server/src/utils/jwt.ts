import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

export interface TokenPayload {
  userId: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Create a refresh token and store its hash in the database */
export async function createStoredRefreshToken(
  userId: string,
): Promise<string> {
  const token = signRefreshToken({ userId });
  const tokenHash = hashToken(token);

  // Parse expiration from the JWT
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return token;
}

/** Verify a refresh token exists in DB and is not revoked */
export async function verifyStoredRefreshToken(
  token: string,
): Promise<TokenPayload> {
  // First verify the JWT signature
  const payload = verifyRefreshToken(token);

  // Then check the DB
  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null },
  });

  if (!stored) {
    throw new Error("Refresh token revoked or not found");
  }

  return payload;
}

/** Revoke a specific refresh token */
export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revoke all refresh tokens for a user */
export async function revokeAllUserRefreshTokens(
  userId: string,
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
