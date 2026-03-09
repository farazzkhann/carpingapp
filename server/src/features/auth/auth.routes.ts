import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  validate({ body: refreshSchema }),
  authController.refresh
);

// POST /api/auth/logout
router.post(
  "/logout",
  validate({ body: refreshSchema }),
  authController.logout
);

// GET /api/auth/me (protected)
router.get("/me", authenticate, authController.getMe);

// PATCH /api/auth/profile (protected)
router.patch("/profile", authenticate, validate({ body: updateProfileSchema }), authController.updateProfile);

// POST /api/auth/change-password (protected)
router.post("/change-password", authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

// POST /api/auth/reset-password (public — token in body)
router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword
);

export default router;
