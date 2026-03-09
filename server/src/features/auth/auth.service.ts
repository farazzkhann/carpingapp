import crypto from "crypto";
import { prisma } from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../middleware/error-handler.js";
import { env } from "../../config/env.js";
import { sendPasswordResetEmail } from "../../utils/email.js";
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from "./auth.schema.js";

// Strip passwordHash from user before returning
function sanitizeUser(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  subscriptionStatus: string;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
}) {
  const { passwordHash: _, ...safeUser } = user as typeof user & { passwordHash: string };
  return safeUser;
}

export async function register(data: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ApiError("Email is already registered", 409);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      passwordHash,
      phone: data.phone || null,
    },
  });

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function login(data: LoginInput) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  // Verify password
  const isValid = await comparePassword(data.password, user.passwordHash);

  if (!isValid) {
    throw new ApiError("Invalid email or password", 401);
  }

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshTokenStr: string) {
  // Verify the token is valid JWT
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenStr);
  } catch {
    throw new ApiError("Invalid refresh token", 401);
  }

  // Check if token exists in database (not revoked)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenStr },
  });

  if (!storedToken) {
    throw new ApiError("Refresh token has been revoked", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new ApiError("Refresh token has expired", 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return { accessToken };
}

export async function logout(refreshTokenStr: string) {
  // Delete the refresh token (revoke it)
  await prisma.refreshToken.deleteMany({
    where: { token: refreshTokenStr },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { cars: true },
      },
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    ...sanitizeUser(user),
    carCount: user._count.cars,
  };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      phone: data.phone === "" ? null : data.phone,
    },
  });
  return sanitizeUser(updated);
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isValid = await comparePassword(data.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError("Current password is incorrect", 400);
  }

  const newHash = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success — don't reveal whether the email exists
  if (!user) {
    return { message: "If an account with that email exists, a reset link has been sent." };
  }

  // Delete any existing reset tokens for this user (only one active at a time)
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Generate a cryptographically secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return { message: "If an account with that email exists, a reset link has been sent." };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record) {
    throw new ApiError("Invalid or expired reset link", 400);
  }

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { tokenHash } });
    throw new ApiError("Reset link has expired. Please request a new one.", 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // Delete the token — single use only
  await prisma.passwordResetToken.delete({ where: { tokenHash } });
}
