import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { AuthRequest } from "../middleware/auth.js";
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
  const tokens = {
    accessToken: signAccessToken({ userId: user.id }),
    refreshToken: signRefreshToken({ userId: user.id }),
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    } satisfies ApiResponse);
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    } satisfies ApiResponse);
    return;
  }

  const userPublic = toUserPublic(user);
  const tokens = {
    accessToken: signAccessToken({ userId: user.id }),
    refreshToken: signRefreshToken({ userId: user.id }),
  };

  res.json({
    success: true,
    data: { user: userPublic, tokens },
  } satisfies ApiResponse<AuthResponse>);
}

export async function refreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      error: "Refresh token required",
    } satisfies ApiResponse);
    return;
  }

  try {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      res
        .status(401)
        .json({ success: false, error: "User not found" } satisfies ApiResponse);
      return;
    }

    const tokens = {
      accessToken: signAccessToken({ userId: user.id }),
      refreshToken: signRefreshToken({ userId: user.id }),
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

  res.json({ success: true } satisfies ApiResponse);
}
