import type { Request, Response } from "express";
import * as notificationsService from "./notifications.service.js";
import { sendSuccess, sendError } from "../../utils/api-response.js";

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationsService.getNotifications(userId);
    sendSuccess(res, notifications);
  } catch (error) {
    sendError(res, "Failed to get notifications", 500);
  }
}

export async function getNotificationsByCarId(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { carId } = req.params;
    const notifications = await notificationsService.getNotificationsByCarId(carId, userId);
    sendSuccess(res, notifications);
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to get notifications", 500);
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await notificationsService.getUnreadCount(userId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, "Failed to get unread count", 500);
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const notification = await notificationsService.markAsRead(id, userId);
    sendSuccess(res, notification, 200, "Marked as read");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to mark as read", 500);
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    await notificationsService.markAllAsRead(userId);
    sendSuccess(res, null, 200, "All notifications marked as read");
  } catch (error) {
    sendError(res, "Failed to mark all as read", 500);
  }
}
