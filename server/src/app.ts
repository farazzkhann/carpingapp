import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler.js";
import { sendSuccess } from "./utils/api-response.js";
import authRoutes from "./features/auth/auth.routes.js";
import carsRoutes from "./features/cars/cars.routes.js";
import qrRoutes from "./features/qr/qr.routes.js";
import notificationsRoutes from "./features/notifications/notifications.routes.js";

const app = express();

// ── Core Middleware ────────────────────────────────────
app.use(cors({
  origin: "*", // Allow all origins in development
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────
app.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
  });
});

// ── API Routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/qr", qrRoutes);

// ── 404 Handler ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ── Global Error Handler ──────────────────────────────
app.use(errorHandler);

export default app;
