import type { Prisma } from "../../generated/prisma/client.js";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const PROVIDER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PLACED: ["CONFIRMED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

export const CUSTOMER_CANCELLABLE_FROM = ["PLACED"];

export const rentalOrderInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      gearItem: {
        select: { id: true, name: true, pricePerDay: true, providerId: true },
      },
    },
  },
  payment: true,
} satisfies Prisma.RentalOrderInclude;
