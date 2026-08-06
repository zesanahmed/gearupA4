import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { reviewService } from "./review.service";
import type { CreateReviewInput } from "./review.validation";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { body } = req.validated as { body: CreateReviewInput };
  const review = await reviewService.createReview(req.user!.userId, body);
  res
    .status(201)
    .json(new ApiResponse("Review submitted successfully", review));
});

export const reviewController = { createReview };
