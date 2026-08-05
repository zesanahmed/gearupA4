import { z } from "zod";

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().optional(),
      role: z.enum(["CUSTOMER", "PROVIDER"]).default("CUSTOMER"),
    })
    .strict(),
});

const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    })
    .strict(),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];

export const authValidation = {
  registerSchema,
  loginSchema,
};
