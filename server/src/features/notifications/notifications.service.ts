import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../middleware/error-handler.js";

// All notifications across all cars owned by the user
export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { car: { userId } },
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: { id: true, licensePlate: true, make: true, model: true },
      },
    },
  });
}

// Notifications for a single car (must belong to the user)
export async function getNotificationsByCarId(carId: string, userId: string) {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car || car.userId !== userId) {
    throw new ApiError("Car not found", 404);
  }

  return prisma.notification.findMany({
    where: { carId },
    orderBy: { createdAt: "desc" },
  });
}

// Count of unread notifications across all the user's cars
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { car: { userId }, isRead: false },
  });
  return { count };
}

export async function markAsRead(id: string, userId: string) {
  // Verify the notification belongs to the user via the car relation
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: { car: { select: { userId: true } } },
  });

  if (!notification || notification.car.userId !== userId) {
    throw new ApiError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { car: { userId }, isRead: false },
    data: { isRead: true },
  });
}
