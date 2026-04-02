import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import {
  signAccessToken,
  createStoredRefreshToken,
  verifyStoredRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "../utils/jwt.js";
import { AuthRequest } from "../middleware/auth.js";
import { bruteForceStore } from "../middleware/brute-force.js";
import { PASSWORD_MIN_LENGTH } from "@supermaker/shared";
import type { UserPublic, AuthResponse, ApiResponse } from "@supermaker/shared";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  displayName: z.string().min(1).max(100).optional(),
  locale: z.enum(["es", "en"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toUserPublic(user: {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  plan: "FREE" | "PREMIUM";
  planExpiresAt: Date | null;
  createdAt: Date;
}): UserPublic {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const { email, password, displayName, locale } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Hash a dummy password so response time is consistent whether email exists or not
    await bcrypt.hash(password, 12);
    res.status(409).json({
      success: false,
      error: "Email already registered",
    } satisfies ApiResponse);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: displayName ?? null,
      locale: locale ?? "es",
    },
  });

  const userPublic = toUserPublic(user);
  const refreshToken = await createStoredRefreshToken(user.id);
  const tokens = {
    accessToken: signAccessToken({ userId: user.id }),
    refreshToken,
  };

  res.status(201).json({
    success: true,
    data: { user: userPublic, tokens },
  } satisfies ApiResponse<AuthResponse>);
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const { email, password } = parsed.data;
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    bruteForceStore.recordFailure(ip, email);
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    } satisfies ApiResponse);
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    bruteForceStore.recordFailure(ip, email);
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    } satisfies ApiResponse);
    return;
  }

  // Login successful — clear brute force counters
  bruteForceStore.recordSuccess(ip, email);

  const userPublic = toUserPublic(user);
  const refreshToken = await createStoredRefreshToken(user.id);
  const tokens = {
    accessToken: signAccessToken({ userId: user.id }),
    refreshToken,
  };

  res.json({
    success: true,
    data: { user: userPublic, tokens },
  } satisfies ApiResponse<AuthResponse>);
}

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

export async function refreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const token = parsed.data.refreshToken;

  try {
    const payload = await verifyStoredRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      res
        .status(401)
        .json({ success: false, error: "User not found" } satisfies ApiResponse);
      return;
    }

    // Revoke the old token and issue a new one (token rotation)
    await revokeRefreshToken(token);
    const newRefreshToken = await createStoredRefreshToken(user.id);

    const tokens = {
      accessToken: signAccessToken({ userId: user.id }),
      refreshToken: newRefreshToken,
    };

    res.json({
      success: true,
      data: { tokens },
    } satisfies ApiResponse);
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    } satisfies ApiResponse);
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    res
      .status(404)
      .json({ success: false, error: "User not found" } satisfies ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: toUserPublic(user),
  } satisfies ApiResponse<UserPublic>);
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const updateSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    locale: z.enum(["es", "en"]).optional(),
  });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: parsed.data,
  });

  res.json({
    success: true,
    data: toUserPublic(user),
  } satisfies ApiResponse<UserPublic>);
}

export async function changePassword(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(PASSWORD_MIN_LENGTH),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res
      .status(404)
      .json({ success: false, error: "User not found" } satisfies ApiResponse);
    return;
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    res.status(401).json({
      success: false,
      error: "Current password is incorrect",
    } satisfies ApiResponse);
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: req.userId },
    data: { passwordHash },
  });

  // Revoke all refresh tokens — forces re-login on all devices
  await revokeAllUserRefreshTokens(req.userId!);

  res.json({ success: true } satisfies ApiResponse);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  await revokeRefreshToken(parsed.data.refreshToken);

  res.json({ success: true } satisfies ApiResponse);
}
