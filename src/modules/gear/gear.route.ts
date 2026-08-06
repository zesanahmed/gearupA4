import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth";
import { gearValidation } from "./gear.validation";
import { gearController } from "./gear.controller";

const router = Router();

// Provider only
router.post(
  "/provider/gear",
  authenticate,
  authorize("PROVIDER"),
  validate(gearValidation.createGearSchema),
  gearController.createGear,
);

router.put(
  "/provider/gear/:id",
  authenticate,
  authorize("PROVIDER"),
  validate(gearValidation.updateGearSchema),
  gearController.updateGear,
);

export default router;
