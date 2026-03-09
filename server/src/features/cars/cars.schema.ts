import { z } from "zod";

export const createCarSchema = z.object({
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .max(20, "License plate is too long")
    .transform((v) => v.toUpperCase().trim()),
  make: z.string().min(1, "Make is required").max(50, "Make is too long"),
  model: z.string().min(1, "Model is required").max(50, "Model is too long"),
  color: z.string().min(1, "Color is required").max(30, "Color is too long"),
  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future")
    .optional(),
  nickname: z
    .string()
    .max(50, "Nickname is too long")
    .optional()
    .or(z.literal("")),
});

// All fields optional on update — PATCH semantics
export const updateCarSchema = createCarSchema.partial();

export const carIdSchema = z.object({
  id: z.string().uuid("Invalid car ID"),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
