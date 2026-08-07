import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { paymentService } from "./payment.service.js";
import type { CreatePaymentInput } from "./payment.validation.js";
import { ApiError } from "../../utils/ApiError.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { body } = req.validated as { body: CreatePaymentInput };
  const result = await paymentService.createPayment(
    req.user!.userId,
    body.rentalOrderId,
  );
  res.status(201).json(new ApiResponse("Checkout session created", result));
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    throw new ApiError(400, "Missing Stripe signature header");
  }

  const result = await paymentService.handleStripeWebhook(
    req.body as Buffer,
    signature,
  );
  res.status(200).json(result);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getUserPayments(
    req.user!.userId,
    req.user!.role,
  );
  res
    .status(200)
    .json(new ApiResponse("Payments fetched successfully", payments));
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { params } = req.validated as { params: { id: string } };
  const payment = await paymentService.getPaymentById(
    params.id,
    req.user!.userId,
    req.user!.role,
  );
  res
    .status(200)
    .json(new ApiResponse("Payment fetched successfully", payment));
});

export const paymentController = {
  createPayment,
  stripeWebhook,
  getMyPayments,
  getPaymentById,
};
