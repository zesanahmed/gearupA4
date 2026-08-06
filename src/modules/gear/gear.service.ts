import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildUpdateGearData } from "./gear.mapper";
import type { CreateGearInput, UpdateGearInput } from "./gear.validation";

const createGear = async (providerId: string, payload: CreateGearInput) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return prisma.gearItem.create({
    data: {
      providerId,
      categoryId: payload.categoryId,
      name: payload.name,
      pricePerDay: payload.pricePerDay,
      stock: payload.stock,
      images: payload.images ?? [],

      ...(payload.brand !== undefined && {
        brand: payload.brand,
      }),

      ...(payload.description !== undefined && {
        description: payload.description,
      }),

      ...(payload.specs !== undefined && {
        specs: payload.specs,
      }),
    },
  });
};

const updateGear = async (
  providerId: string,
  gearId: string,
  payload: UpdateGearInput,
) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });

  if (!gear) {
    throw new ApiError(404, "Gear item not found");
  }
  if (gear.providerId !== providerId) {
    throw new ApiError(403, "You can only update your own gear listings");
  }

  return prisma.gearItem.update({
    where: { id: gearId },
    data: buildUpdateGearData,
  });
};
export const gearService = {
  createGear,
  updateGear,
};
