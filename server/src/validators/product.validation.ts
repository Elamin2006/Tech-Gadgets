import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .toLowerCase()
    .trim(),

  description: z
    .string()
    .min(10)
    .trim(),

  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/),

  price: z
    .number()
    .positive(),

  discount: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  quantity: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .toLowerCase()
    .trim()
    .optional(),

  description: z
    .string()
    .min(10)
    .trim()
    .optional(),

  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  price: z
    .number()
    .positive()
    .optional(),

  discount: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  quantity: z
    .number()
    .int()
    .min(0)
    .optional(),
});