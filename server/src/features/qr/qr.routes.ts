import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { qrCodeIdSchema, notifySchema } from "./qr.schema.js";
import * as qrController from "./qr.controller.js";

const router = Router();

// Public routes — no authentication required
router.get("/:qrCodeId", validate({ params: qrCodeIdSchema }), qrController.getCarInfo);
router.post("/:qrCodeId/notify", validate({ params: qrCodeIdSchema, body: notifySchema }), qrController.notify);

export default router;
