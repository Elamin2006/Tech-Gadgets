import { z } from "zod";

export const registerValidation = z.object({
  firstName: z
    .string()
    .min(3)
    .max(15)
    .toLowerCase(),

  lastName: z
    .string()
    .min(3)
    .max(15)
    .toLowerCase(),

  email: z
    .email()
    .min(3)
    .toLowerCase(),

  password: z
    .string()
    .min(6)
    .max(30)
    .trim(),

  role: z
    .string()
    .trim()
    .optional(),
});

export const loginValidation = z.object({
  email: z
    .email()
    .min(3)
    .toLowerCase(),

  password: z
    .string()
    .min(6)
    .max(30)
    .trim(),
});