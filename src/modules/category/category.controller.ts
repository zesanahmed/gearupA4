import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { categoryService } from "./category.service.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res
    .status(201)
    .json(new ApiResponse("Category created successfully", category));
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res
    .status(200)
    .json(new ApiResponse("Categories fetched successfully", categories));
});

export const categoryController = {
  createCategory,
  getAllCategories,
};
