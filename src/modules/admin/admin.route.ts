import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { adminValidation } from "./admin.validation.js";
import { adminController } from "./admin.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN")); // এই route file-এর সব endpoint শুধু Admin-এর জন্য

router.get("/admin/users", adminController.getAllUsers);
router.patch(
  "/admin/users/:id",
  validate(adminValidation.updateUserStatusSchema),
  adminController.updateUserStatus,
);
router.get("/admin/gear", adminController.getAllGear);
router.get("/admin/rentals", adminController.getAllRentals);

export default router;
