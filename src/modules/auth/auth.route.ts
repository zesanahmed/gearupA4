import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

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
