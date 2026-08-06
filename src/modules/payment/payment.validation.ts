import { z } from "zod";

const createPaymentSchema = z.object({
  body: z
    .object({
      rentalOrderId: z.uuid("Invalid rental order ID"),
    })
    .strict(),
});

const paymentIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid payment ID"),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>["body"];

export const paymentValidation = {
  createPaymentSchema,
  paymentIdParamSchema,
};
