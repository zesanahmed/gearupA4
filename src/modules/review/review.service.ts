import prisma from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateReviewInput } from "./review.validation.js";

const createReview = async (customerId: string, payload: CreateReviewInput) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id: payload.gearItemId },
  });

  if (!gearItem) {
    throw new ApiError(404, "Gear item not found");
  }

  const hasReturnedRental = await prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId: payload.gearItemId,
      rentalOrder: { customerId, status: "RETURNED" },
    },
  });

  if (!hasReturnedRental) {
    throw new ApiError(
      403,
      "You can only review gear you have rented and returned",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { customerId, gearItemId: payload.gearItemId },
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this gear item");
  }

  return prisma.review.create({
    data: {
      customer: { connect: { id: customerId } },
      gearItem: { connect: { id: payload.gearItemId } },
      rating: payload.rating,
      ...(payload.comment !== undefined && { comment: payload.comment }),
    },
    include: {
      customer: { select: { id: true, name: true } },
    },
  });
};

export const reviewService = { createReview };
