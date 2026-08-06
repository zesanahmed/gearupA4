import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth";
import { paymentValidation } from "./payment.validation";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/payments/create",
  authenticate,
  authorize("CUSTOMER"),
  validate(paymentValidation.createPaymentSchema),
  paymentController.createPayment,
);
router.get("/payments", authenticate, paymentController.getMyPayments);
router.get(
  "/payments/:id",
  authenticate,
  validate(paymentValidation.paymentIdParamSchema),
  paymentController.getPaymentById,
);

export default router;
