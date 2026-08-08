import type {
  GearItemCreateInput,
  GearItemUpdateInput,
} from "../../generated/prisma/models/GearItem.js";
import type { CreateGearInput, UpdateGearInput } from "./gear.validation.js";

/**
 * Build Prisma create input for GearItem
 */
export const buildCreateGearData = (
  providerId: string,
  payload: CreateGearInput,
): GearItemCreateInput => ({
  provider: {
    connect: {
      id: providerId,
    },
  },

  category: {
    connect: {
      id: payload.categoryId,
    },
  },

  name: payload.name,

  pricePerDay: payload.pricePerDay,

  stock: payload.stock,

  images: payload.images,

  ...(payload.brand !== undefined && {
    brand: payload.brand,
  }),

  ...(payload.description !== undefined && {
    description: payload.description,
  }),

  ...(payload.specs !== undefined && {
    specs: payload.specs,
  }),
});

/**
 * Build Prisma update input for GearItem
 */
export const buildUpdateGearData = (
  payload: UpdateGearInput,
): GearItemUpdateInput => ({
  ...(payload.categoryId !== undefined && {
    category: {
      connect: {
        id: payload.categoryId,
      },
    },
  }),

  ...(payload.name !== undefined && {
    name: payload.name,
  }),

  ...(payload.brand !== undefined && {
    brand: payload.brand,
  }),

  ...(payload.description !== undefined && {
    description: payload.description,
  }),

  ...(payload.specs !== undefined && {
    specs: payload.specs,
  }),

  ...(payload.pricePerDay !== undefined && {
    pricePerDay: payload.pricePerDay,
  }),

  ...(payload.stock !== undefined && {
    stock: payload.stock,
  }),

  ...(payload.isAvailable !== undefined && {
    isAvailable: payload.isAvailable,
  }),

  ...(payload.images !== undefined && {
    images: {
      set: payload.images,
    },
  }),
});
