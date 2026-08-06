import stripe from "../../lib/stripe";
import prisma from "../../lib/prisma";
import config from "../../config";
import { ApiError } from "../../utils/ApiError";
import { paymentInclude, PAYABLE_ORDER_STATUS } from "./payment.constants";
import { rentalOrderService } from "../rentalOrder/rentalOrder.service";
import type Stripe from "stripe";

// ---- Create checkout session ----

const createPayment = async (customerId: string, rentalOrderId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });

  if (!order) {
    throw new ApiError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new ApiError(403, "You can only pay for your own rental orders");
  }
  if (order.status !== PAYABLE_ORDER_STATUS) {
    throw new ApiError(
      409,
      `Order must be confirmed by the provider before payment. Current status: ${order.status}`,
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { rentalOrderId },
  });

  if (existingPayment?.status === "COMPLETED") {
    throw new ApiError(409, "This order has already been paid");
  }

  const amountInSmallestUnit = Math.round(Number(order.totalAmount) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: config.STRIPE_CURRENCY,
          product_data: {
            name: `GearUp Rental Order #${order.id.slice(0, 8)}`,
          },
          unit_amount: amountInSmallestUnit,
        },
        quantity: 1,
      },
    ],
    metadata: { rentalOrderId: order.id },
    success_url: `${config.CLIENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.CLIENT_CANCEL_URL,
  });

  const payment = existingPayment
    ? await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: session.id,
          status: "PENDING",
          amount: order.totalAmount,
        },
      })
    : await prisma.payment.create({
        data: {
          rentalOrder: { connect: { id: order.id } },
          transactionId: session.id,
          amount: order.totalAmount,
          method: "STRIPE",
          status: "PENDING",
        },
      });

  return { checkoutUrl: session.url, payment };
};

// ---- Webhook handler ----

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new ApiError(
      400,
      `Webhook signature verification failed: ${(err as Error).message}`,
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handlePaymentSuccess(session.id);
  } else if (event.type === "checkout.session.expired") {
    await handlePaymentFailure(session_id_from_expired_event(event));
  }

  return { received: true };
};

const session_id_from_expired_event = (event: Stripe.Event): string => {
  const session = event.data.object as Stripe.Checkout.Session;
  return session.id;
};

const handlePaymentSuccess = async (stripeSessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: stripeSessionId },
  });

  if (!payment) return;

  if (payment.status === "COMPLETED") return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: "PAID" },
    });
  });
};

const handlePaymentFailure = async (stripeSessionId: string) => {
  await prisma.payment.updateMany({
    where: { transactionId: stripeSessionId, status: "PENDING" },
    data: { status: "FAILED" },
  });
};

// ---- Read ----

const getUserPayments = async (userId: string, role: string) => {
  const where = role === "ADMIN" ? {} : { rentalOrder: { customerId: userId } };

  return prisma.payment.findMany({
    where,
    include: paymentInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (
  paymentId: string,
  userId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  if (role !== "ADMIN" && payment.rentalOrder.customerId !== userId) {
    throw new ApiError(403, "You do not have access to this payment");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  handleStripeWebhook,
  getUserPayments,
  getPaymentById,
};
