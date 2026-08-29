import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "productId must be a valid Mongo Object ID",
  );

export const addToCartSchema = z.object({
  productId: objectIdSchema,

  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .default(1),
});

export const updateCartItemSchema = z.object({
  productId: objectIdSchema,

  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1"),
});

export const cartProductIdSchema = z.object({
  productId: objectIdSchema,
});

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code is required")
    .max(50, "Coupon code is too long"),
});