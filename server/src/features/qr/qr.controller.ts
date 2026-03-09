import type { Request, Response } from "express";
import * as qrService from "./qr.service.js";
import { sendSuccess, sendError } from "../../utils/api-response.js";
import type { NotifyInput } from "./qr.schema.js";

export async function getCarInfo(req: Request, res: Response) {
  try {
    const { qrCodeId } = req.params;
    const car = await qrService.getCarByQrCode(qrCodeId);
    sendSuccess(res, car);
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to get car info", 500);
  }
}

export async function notify(req: Request, res: Response) {
  try {
    const { qrCodeId } = req.params;
    const data = req.body as NotifyInput;
    const notification = await qrService.sendNotification(qrCodeId, data);
    sendSuccess(res, notification, 201, "Notification sent to car owner");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to send notification", 500);
  }
}
