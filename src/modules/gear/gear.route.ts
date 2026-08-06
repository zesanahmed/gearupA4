import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/auth";

import { validate } from "../../middlewares/validate";

import { gearController } from "./gear.controller";
import { gearValidation } from "./gear.validation";

const router = Router();

// Public Routes

router.get(
  "/gear",
  validate(gearValidation.getGearQuerySchema),
  gearController.getAllGear,
);

router.get(
  "/gear/:id",
  validate(gearValidation.gearIdParamSchema),
  gearController.getGearById,
);

// Provider Routes

router.post(
  "/provider/gear",
  authenticate,
  authorize("PROVIDER"),
  validate(gearValidation.createGearSchema),
  gearController.createGear,
);

router.get(
  "/provider/gear",
  authenticate,
  authorize("PROVIDER"),
  gearController.getProviderGear,
);

router.put(
  "/provider/gear/:id",
  authenticate,
  authorize("PROVIDER"),
  validate(gearValidation.updateGearSchema),
  gearController.updateGear,
);

router.delete(
  "/provider/gear/:id",
  authenticate,
  authorize("PROVIDER"),
  validate(gearValidation.gearIdParamSchema),
  gearController.deleteGear,
);

export default router;
