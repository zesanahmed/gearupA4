import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { reviewService } from "./review.service.js";
import type { CreateReviewInput } from "./review.validation.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { body } = req.validated as { body: CreateReviewInput };
  const review = await reviewService.createReview(req.user!.userId, body);
  res
    .status(201)
    .json(new ApiResponse("Review submitted successfully", review));
});

export const reviewController = { createReview };
