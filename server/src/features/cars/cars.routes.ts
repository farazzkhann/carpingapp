import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCarSchema, updateCarSchema, carIdSchema } from "./cars.schema.js";
import * as carsController from "./cars.controller.js";

const router = Router();

// All car routes require authentication
router.use(authenticate);

router.get("/", carsController.getCars);
router.get("/:id", validate({ params: carIdSchema }), carsController.getCarById);
router.post("/", validate({ body: createCarSchema }), carsController.createCar);
router.put("/:id", validate({ params: carIdSchema, body: createCarSchema }), carsController.updateCar);
router.patch("/:id", validate({ params: carIdSchema, body: updateCarSchema }), carsController.updateCar);
router.delete("/:id", validate({ params: carIdSchema }), carsController.deleteCar);

export default router;
