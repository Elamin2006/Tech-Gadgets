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
    .min(1)
    .default(1),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1),
});