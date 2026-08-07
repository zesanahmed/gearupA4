import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { createCategorySchema } from "./category.validation.js";
import { categoryController } from "./category.controller.js";

const router = Router();

// Public
router.get("/categories", categoryController.getAllCategories);

// Admin only
router.post(
  "/admin/categories",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  categoryController.createCategory,
);

export default router;
