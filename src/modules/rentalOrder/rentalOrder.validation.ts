import { z } from "zod";

const createRentalOrderSchema = z.object({
  body: z
    .object({
      items: z
        .array(
          z.object({
            gearItemId: z.uuid("Invalid gear item ID"),
            quantity: z.coerce
              .number()
              .int()
              .positive("Quantity must be at least 1"),
          }),
        )
        .min(1, "At least one item is required"),
      startDate: z.coerce.date("Invalid start date"),
      endDate: z.coerce.date("Invalid end date"),
    })
    .strict()
    .refine((data) => data.endDate > data.startDate, {
      message: "End date must be after start date",
      path: ["endDate"],
    })
    .refine((data) => data.startDate >= new Date(new Date().toDateString()), {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }),
});

const rentalOrderIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid rental order ID"),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid rental order ID"),
  }),
  body: z
    .object({
      status: z.enum(
        ["CONFIRMED", "PICKED_UP", "RETURNED"],
        "Invalid status value",
      ),
    })
    .strict(),
});

export type CreateRentalOrderInput = z.infer<
  typeof createRentalOrderSchema
>["body"];
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>["body"];

export const rentalOrderValidation = {
  createRentalOrderSchema,
  rentalOrderIdParamSchema,
  updateOrderStatusSchema,
};
