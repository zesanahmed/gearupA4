import type { PaymentInclude } from "../../generated/prisma/models/Payment.js";

export const paymentInclude = {
  rentalOrder: {
    select: { id: true, customerId: true, status: true, totalAmount: true },
  },
} satisfies PaymentInclude;

export const PAYABLE_ORDER_STATUS = "CONFIRMED";
