import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { NotifyInput } from "./qr.schema.js";

// Public car info — only what's needed for the scan page (no userId, no sensitive data)
export async function getCarByQrCode(qrCodeId: string) {
  const car = await prisma.car.findUnique({
    where: { qrCodeId },
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
      color: true,
      year: true,
      nickname: true,
      qrCodeId: true,
    },
  });

  if (!car) {
    throw new ApiError("Car not found", 404);
  }

  return car;
}

// Creates a notification for the car owner without exposing their identity
export async function sendNotification(qrCodeId: string, data: NotifyInput) {
  const car = await prisma.car.findUnique({
    where: { qrCodeId },
    select: { id: true },
  });

  if (!car) {
    throw new ApiError("Car not found", 404);
  }

  const notification = await prisma.notification.create({
    data: {
      carId: car.id,
      type: data.type,
      message: data.message,
      senderName: data.senderName ?? null,
    },
  });

  return notification;
}
