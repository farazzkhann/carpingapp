import { z } from "zod";

export const notificationIdSchema = z.object({
  id: z.string().uuid("Invalid notification ID"),
});

export const carIdParamSchema = z.object({
  carId: z.string().uuid("Invalid car ID"),
});
