import { z } from "zod";

const createReviewSchema = z.object({
  body: z
    .object({
      gearItemId: z.uuid("Invalid gear item ID"),
      rating: z.coerce
        .number()
        .int()
        .min(1, "Rating must be between 1 and 5")
        .max(5, "Rating must be between 1 and 5"),
      comment: z.string().trim().max(1000, "Comment is too long").optional(),
    })
    .strict(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];

export const reviewValidation = { createReviewSchema };
