import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/auth.js";
import { authController } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  validate(authValidation.registerSchema),
  authController.register,
);
router.post(
  "/login",
  validate(authValidation.loginSchema),
  authController.login,
);
router.get("/me", authenticate, authController.me);

export default router;
