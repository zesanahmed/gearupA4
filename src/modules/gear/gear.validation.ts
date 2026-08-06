import { z } from "zod";
import { Prisma } from "../../generated/prisma/client";

//Create Gear

const createGearSchema = z.object({
  body: z
    .object({
      categoryId: z.uuid("Invalid category ID"),

      name: z.string().trim().min(2, "Name must be at least 2 characters"),

      brand: z.string().trim().optional(),

      description: z.string().trim().optional(),

      specs: z.record(z.string(), z.unknown()).optional(),

      pricePerDay: z.coerce.number().positive("Price must be greater than 0"),

      stock: z.coerce
        .number()
        .int()
        .min(0, "Stock cannot be negative")
        .default(0),

      images: z.array(z.url("Each image must be a valid URL")).default([]),
    })
    .strict(),
});

// Update Gear

const updateGearSchema = z.object({
  body: z
    .object({
      categoryId: z.uuid().optional(),

      name: z.string().trim().min(2).optional(),

      brand: z.string().trim().optional(),

      description: z.string().trim().optional(),

      specs: z.record(z.string(), z.unknown()).optional(),

      pricePerDay: z.coerce.number().positive().optional(),

      stock: z.coerce.number().int().min(0).optional(),

      isAvailable: z.boolean().optional(),

      images: z.array(z.url()).optional(),
    })
    .strict(),

  params: z.object({
    id: z.uuid("Invalid gear ID"),
  }),
});

// Params

const gearIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid gear ID"),
  }),
});

// Query

const getGearQuerySchema = z.object({
  query: z
    .object({
      category: z.string().trim().optional(),

      brand: z.string().trim().optional(),

      minPrice: z.coerce.number().nonnegative().optional(),

      maxPrice: z.coerce.number().nonnegative().optional(),

      available: z.enum(["true", "false"]).optional(),

      search: z.string().trim().optional(),

      page: z.coerce.number().int().positive().default(1),

      limit: z.coerce.number().int().positive().max(100).default(10),
    })
    .strict(),
});

export type CreateGearInput = Omit<
  z.infer<typeof createGearSchema>["body"],
  "specs"
> & {
  specs?: Prisma.InputJsonValue;
};

export type UpdateGearInput = Omit<
  z.infer<typeof updateGearSchema>["body"],
  "specs"
> & {
  specs?: Prisma.InputJsonValue;
};
// export type CreateGearInput = z.infer<typeof createGearSchema>["body"];

// export type UpdateGearInput = z.infer<typeof updateGearSchema>["body"];

export type GetGearQuery = z.infer<typeof getGearQuerySchema>["query"];

export const gearValidation = {
  createGearSchema,
  updateGearSchema,
  gearIdParamSchema,
  getGearQuerySchema,
};
