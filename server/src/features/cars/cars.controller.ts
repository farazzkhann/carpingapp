import type { Request, Response } from "express";
import * as carsService from "./cars.service.js";
import { sendSuccess, sendError } from "../../utils/api-response.js";
import type { CreateCarInput, UpdateCarInput } from "./cars.schema.js";

export async function getCars(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const cars = await carsService.getCars(userId);
    sendSuccess(res, cars);
  } catch (error) {
    sendError(res, "Failed to get cars", 500);
  }
}

export async function getCarById(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const car = await carsService.getCarById(id, userId);
    sendSuccess(res, car);
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to get car", 500);
  }
}

export async function createCar(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = req.body as CreateCarInput;
    const car = await carsService.createCar(userId, data);
    sendSuccess(res, car, 201, "Car added successfully");
  } catch (error) {
    sendError(res, "Failed to create car", 500);
  }
}

export async function updateCar(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = req.body as UpdateCarInput;
    const car = await carsService.updateCar(id, userId, data);
    sendSuccess(res, car, 200, "Car updated successfully");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to update car", 500);
  }
}

export async function deleteCar(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await carsService.deleteCar(id, userId);
    sendSuccess(res, null, 200, "Car deleted successfully");
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, error.message, (error as { statusCode: number }).statusCode);
      return;
    }
    sendError(res, "Failed to delete car", 500);
  }
}
