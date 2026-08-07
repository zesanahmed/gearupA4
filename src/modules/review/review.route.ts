import { Router } from "express";

import { reviewValidation } from "./review.validation.js";
import { reviewController } from "./review.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

const router = Router();

router.post(
  "/reviews",
  authenticate,
  authorize("CUSTOMER"),
  validate(reviewValidation.createReviewSchema),
  reviewController.createReview,
);

export default router;
