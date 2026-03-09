import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/api-response.js";
import type { RegisterInput, LoginInput, RefreshInput, ForgotPasswordInput, UpdateProfileInput, ChangePasswordInput, ResetPasswordInput } from "./auth.schema.js";

export async function register(req: Request, res: Response) {
  try {
    const data = req.body as RegisterInput;
    const result = await authService.register(data);
    sendSuccess(res, result, 201, "Account created successfully");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Registration failed", 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = req.body as LoginInput;
    const result = await authService.login(data);
    sendSuccess(res, result, 200, "Login successful");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Login failed", 500);
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as RefreshInput;
    const result = await authService.refresh(refreshToken);
    sendSuccess(res, result, 200, "Token refreshed");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Token refresh failed", 500);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as RefreshInput;
    await authService.logout(refreshToken);
    sendSuccess(res, null, 200, "Logged out successfully");
  } catch {
    sendError(res, "Logout failed", 500);
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const user = await authService.getMe(userId);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to get user", 500);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body as ForgotPasswordInput;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result);
  } catch {
    sendError(res, "Failed to process request", 500);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = req.body as UpdateProfileInput;
    const user = await authService.updateProfile(userId, data);
    sendSuccess(res, user, 200, "Profile updated successfully");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to update profile", 500);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = req.body as ChangePasswordInput;
    await authService.changePassword(userId, data);
    sendSuccess(res, null, 200, "Password changed successfully");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to change password", 500);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body as ResetPasswordInput;
    await authService.resetPassword(token, newPassword);
    sendSuccess(res, null, 200, "Password reset successfully. You can now log in.");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to reset password", 500);
  }
}
