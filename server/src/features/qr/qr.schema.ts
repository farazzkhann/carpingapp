import { z } from "zod";

export const qrCodeIdSchema = z.object({
  qrCodeId: z.string().min(1, "QR code ID is required"),
});

export const notifySchema = z.object({
  type: z.enum(["PARKING_ISSUE", "BLOCKING", "ACCIDENT", "EMERGENCY", "GENERAL"], {
    error: "Invalid notification type",
  }),
  message: z.string().min(1, "Message is required").max(500, "Message too long"),
  senderName: z.string().max(100).optional(),
});

export type NotifyInput = z.infer<typeof notifySchema>;
