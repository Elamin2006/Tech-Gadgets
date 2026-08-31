import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Coupon code is required")
    .max(30, "Coupon code cannot exceed 30 characters")
    .transform((value) => value.toUpperCase()),
});
