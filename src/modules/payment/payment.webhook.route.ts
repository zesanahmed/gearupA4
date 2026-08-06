import { Router } from "express";
import express from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/payments/confirm",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

export default router;
