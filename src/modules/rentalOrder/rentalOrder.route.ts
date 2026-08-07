import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { rentalOrderValidation } from "./rentalOrder.validation.js";
import { rentalOrderController } from "./rentalOrder.controller.js";

const router = Router();

// Customer
router.post(
  "/rentals",
  authenticate,
  authorize("CUSTOMER"),
  validate(rentalOrderValidation.createRentalOrderSchema),
  rentalOrderController.createRentalOrder,
);
router.get(
  "/rentals",
  authenticate,
  authorize("CUSTOMER"),
  rentalOrderController.getMyOrders,
);
router.get(
  "/rentals/:id",
  authenticate,
  validate(rentalOrderValidation.rentalOrderIdParamSchema),
  rentalOrderController.getOrderById,
);
router.patch(
  "/rentals/:id/cancel",
  authenticate,
  authorize("CUSTOMER"),
  validate(rentalOrderValidation.rentalOrderIdParamSchema),
  rentalOrderController.cancelOrder,
);

// Provider
router.get(
  "/provider/orders",
  authenticate,
  authorize("PROVIDER"),
  rentalOrderController.getProviderOrders,
);
router.patch(
  "/provider/orders/:id",
  authenticate,
  authorize("PROVIDER"),
  validate(rentalOrderValidation.updateOrderStatusSchema),
  rentalOrderController.updateOrderStatus,
);

export default router;
