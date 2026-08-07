import type { Prisma } from "../../generated/prisma/client.js";

export const paymentInclude = {
  rentalOrder: {
    select: { id: true, customerId: true, status: true, totalAmount: true },
  },
} satisfies Prisma.PaymentInclude;

export const PAYABLE_ORDER_STATUS = "CONFIRMED";
