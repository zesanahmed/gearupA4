import type { Prisma } from "../../generated/prisma/client.js";
import { MS_PER_DAY } from "./rentalOrder.constants.js";

export interface ResolvedOrderItem {
  gearItemId: string;
  quantity: number;
  priceAtBooking: Prisma.Decimal | number;
}

export const calculateRentalDays = (startDate: Date, endDate: Date): number => {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / MS_PER_DAY,
  );
  return Math.max(days, 1);
};

export const calculateTotalAmount = (
  items: ResolvedOrderItem[],
  rentalDays: number,
): number => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.priceAtBooking) * item.quantity,
    0,
  );
  return Number((subtotal * rentalDays).toFixed(2));
};

export const buildRentalOrderCreateData = (
  customerId: string,
  startDate: Date,
  endDate: Date,
  items: ResolvedOrderItem[],
  totalAmount: number,
): Prisma.RentalOrderCreateInput => ({
  customer: { connect: { id: customerId } },
  startDate,
  endDate,
  totalAmount,
  items: {
    create: items.map((item) => ({
      gearItem: { connect: { id: item.gearItemId } },
      quantity: item.quantity,
      priceAtBooking: item.priceAtBooking,
    })),
  },
});
