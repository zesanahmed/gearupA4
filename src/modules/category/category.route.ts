import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth";
import { createCategorySchema } from "./category.validation";
import { categoryController } from "./category.controller";

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
