import type { UpdateGearInput } from "./gear.validation";

export const buildUpdateGearData = (payload: UpdateGearInput) => ({
  ...(payload.categoryId !== undefined && {
    categoryId: payload.categoryId,
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
    images: payload.images,
  }),
});
