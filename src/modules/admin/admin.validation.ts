import { z } from "zod";

const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid user ID"),
  }),
  body: z
    .object({
      status: z.enum(["ACTIVE", "SUSPENDED"], "Invalid status value"),
    })
    .strict(),
});

const userIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid user ID"),
  }),
});

export type UpdateUserStatusInput = z.infer<
  typeof updateUserStatusSchema
>["body"];

export const adminValidation = { updateUserStatusSchema, userIdParamSchema };
