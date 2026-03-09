import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { notificationIdSchema, carIdParamSchema } from "./notifications.schema.js";
import * as notificationsController from "./notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", notificationsController.getNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);
router.get("/car/:carId", validate({ params: carIdParamSchema }), notificationsController.getNotificationsByCarId);
router.patch("/:id/read", validate({ params: notificationIdSchema }), notificationsController.markAsRead);
router.patch("/read-all", notificationsController.markAllAsRead);

export default router;
