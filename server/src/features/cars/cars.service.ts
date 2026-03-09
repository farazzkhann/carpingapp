import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { CreateCarInput, UpdateCarInput } from "./cars.schema.js";

export async function getCars(userId: string) {
  return prisma.car.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCarById(id: string, userId: string) {
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    throw new ApiError("Car not found", 404);
  }

  // Prevent users from accessing other users' cars
  if (car.userId !== userId) {
    throw new ApiError("Car not found", 404); // 404 not 403 — don't reveal existence
  }

  return car;
}

export async function createCar(userId: string, data: CreateCarInput) {
  return prisma.car.create({
    data: {
      ...data,
      userId,
      nickname: data.nickname || null,
    },
  });
}

export async function updateCar(
  id: string,
  userId: string,
  data: UpdateCarInput
) {
  await getCarById(id, userId); // throws 404 if not found or not owned

  return prisma.car.update({
    where: { id },
    data: {
      ...data,
      nickname: data.nickname === "" ? null : data.nickname,
    },
  });
}

export async function deleteCar(id: string, userId: string) {
  await getCarById(id, userId); // throws 404 if not found or not owned

  await prisma.car.delete({ where: { id } });
}
