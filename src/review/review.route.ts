import { Router } from "express";

import { reviewValidation } from "./review.validation";
import { reviewController } from "./review.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";

const router = Router();

router.post(
  "/reviews",
  authenticate,
  authorize("CUSTOMER"),
  validate(reviewValidation.createReviewSchema),
  reviewController.createReview,
);

export default router;
