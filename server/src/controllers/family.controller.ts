import { Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { FAMILY_MAX_MEMBERS, FAMILY_INVITE_EXPIRY_DAYS } from "@supermaker/shared";
import type { ApiResponse } from "@supermaker/shared";

const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required").max(100),
});

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
});

const respondSchema = z.object({
  accept: z.boolean(),
});

/** Create a family group (FAMILY plan owner only) */
export async function createFamily(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (req.userPlan !== "FAMILY") {
    res.status(403).json({
      success: false,
      error: "Family plan required to create a group",
    } satisfies ApiResponse);
    return;
  }

  const parsed = createFamilySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  // Check if user already owns a group
  const existing = await prisma.familyGroup.findFirst({
    where: { ownerId: req.userId },
  });
  if (existing) {
    res.status(409).json({
      success: false,
      error: "You already have a family group",
    } satisfies ApiResponse);
    return;
  }

  const group = await prisma.familyGroup.create({
    data: {
      name: parsed.data.name,
      ownerId: req.userId!,
      members: {
        create: { userId: req.userId!, role: "OWNER" },
      },
    },
    include: {
      members: { include: { user: { select: userSelect } } },
    },
  });

  res.status(201).json({ success: true, data: group } satisfies ApiResponse);
}

/** Get my family group (as owner or member) */
export async function getMyFamily(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const membership = await prisma.familyMember.findFirst({
    where: { userId: req.userId },
    include: {
      group: {
        include: {
          owner: { select: userSelect },
          members: {
            include: { user: { select: userSelect } },
            orderBy: { joinedAt: "asc" },
          },
          invites: {
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!membership) {
    res.json({ success: true, data: null } satisfies ApiResponse);
    return;
  }

  res.json({ success: true, data: membership.group } satisfies ApiResponse);
}

/** Invite a member by email (owner only) */
export async function inviteMember(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const group = await prisma.familyGroup.findFirst({
    where: { ownerId: req.userId },
    include: { members: true, invites: { where: { status: "PENDING" } } },
  });

  if (!group) {
    res.status(404).json({
      success: false,
      error: "You don't have a family group",
    } satisfies ApiResponse);
    return;
  }

  // Check member cap
  const totalMembers = group.members.length + group.invites.length;
  if (totalMembers >= FAMILY_MAX_MEMBERS) {
    res.status(403).json({
      success: false,
      error: `Maximum ${FAMILY_MAX_MEMBERS} members allowed (including pending invites)`,
    } satisfies ApiResponse);
    return;
  }

  const email = parsed.data.email.toLowerCase();

  // Can't invite yourself
  const owner = await prisma.user.findUnique({ where: { id: req.userId } });
  if (owner?.email === email) {
    res.status(400).json({
      success: false,
      error: "You can't invite yourself",
    } satisfies ApiResponse);
    return;
  }

  // Check if already a member
  const existingMember = await prisma.familyMember.findFirst({
    where: { groupId: group.id, user: { email } },
  });
  if (existingMember) {
    res.status(409).json({
      success: false,
      error: "This user is already a member",
    } satisfies ApiResponse);
    return;
  }

  // Check if already invited
  const existingInvite = await prisma.familyInvite.findFirst({
    where: { groupId: group.id, email, status: "PENDING" },
  });
  if (existingInvite) {
    res.status(409).json({
      success: false,
      error: "This email already has a pending invite",
    } satisfies ApiResponse);
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + FAMILY_INVITE_EXPIRY_DAYS);

  const invite = await prisma.familyInvite.create({
    data: {
      groupId: group.id,
      email,
      invitedBy: req.userId!,
      expiresAt,
    },
  });

  res.status(201).json({ success: true, data: invite } satisfies ApiResponse);
}

/** Get pending invites for the authenticated user's email */
export async function getMyInvites(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" } satisfies ApiResponse);
    return;
  }

  // Expire old invites
  await prisma.familyInvite.updateMany({
    where: { email: user.email, status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  const invites = await prisma.familyInvite.findMany({
    where: { email: user.email, status: "PENDING" },
    include: { group: { select: { name: true, owner: { select: userSelect } } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: invites } satisfies ApiResponse);
}

/** Accept or decline an invite */
export async function respondToInvite(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" } satisfies ApiResponse);
    return;
  }

  const invite = await prisma.familyInvite.findFirst({
    where: { id: req.params.id, email: user.email, status: "PENDING" },
    include: { group: { include: { members: true } } },
  });

  if (!invite) {
    res.status(404).json({
      success: false,
      error: "Invite not found or expired",
    } satisfies ApiResponse);
    return;
  }

  if (invite.expiresAt < new Date()) {
    await prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    res.status(410).json({
      success: false,
      error: "This invite has expired",
    } satisfies ApiResponse);
    return;
  }

  if (!parsed.data.accept) {
    await prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: "DECLINED" },
    });
    res.json({ success: true } satisfies ApiResponse);
    return;
  }

  // Check if user already belongs to a family
  const existingMembership = await prisma.familyMember.findFirst({
    where: { userId: req.userId },
  });
  if (existingMembership) {
    res.status(409).json({
      success: false,
      error: "You already belong to a family group. Leave it first to join another.",
    } satisfies ApiResponse);
    return;
  }

  // Check member cap again
  if (invite.group.members.length >= FAMILY_MAX_MEMBERS) {
    res.status(403).json({
      success: false,
      error: "This family group is full",
    } satisfies ApiResponse);
    return;
  }

  // Accept: create member + update invite
  await prisma.$transaction([
    prisma.familyMember.create({
      data: { groupId: invite.groupId, userId: req.userId!, role: "MEMBER" },
    }),
    prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  res.json({ success: true } satisfies ApiResponse);
}

/** Remove a member (owner only) */
export async function removeMember(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const group = await prisma.familyGroup.findFirst({
    where: { ownerId: req.userId },
  });

  if (!group) {
    res.status(403).json({
      success: false,
      error: "Only the group owner can remove members",
    } satisfies ApiResponse);
    return;
  }

  const member = await prisma.familyMember.findFirst({
    where: { id: req.params.id, groupId: group.id },
  });

  if (!member) {
    res.status(404).json({
      success: false,
      error: "Member not found",
    } satisfies ApiResponse);
    return;
  }

  if (member.role === "OWNER") {
    res.status(400).json({
      success: false,
      error: "Cannot remove the group owner",
    } satisfies ApiResponse);
    return;
  }

  await prisma.familyMember.delete({ where: { id: member.id } });

  res.json({ success: true } satisfies ApiResponse);
}

/** Leave a family group (member only, not owner) */
export async function leaveFamily(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const membership = await prisma.familyMember.findFirst({
    where: { userId: req.userId },
  });

  if (!membership) {
    res.status(404).json({
      success: false,
      error: "You are not in a family group",
    } satisfies ApiResponse);
    return;
  }

  if (membership.role === "OWNER") {
    res.status(400).json({
      success: false,
      error: "The owner cannot leave. Delete the group instead.",
    } satisfies ApiResponse);
    return;
  }

  await prisma.familyMember.delete({ where: { id: membership.id } });

  res.json({ success: true } satisfies ApiResponse);
}

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  locale: true,
  plan: true,
  planExpiresAt: true,
  createdAt: true,
} as const;
