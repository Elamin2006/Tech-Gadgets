import { z } from "zod";

export const createCashOrderSchema = z.object({
  shippingAddress: z.object({
    details: z
      .string()
      .min(5, "Shipping details must be at least 5 characters long")
      .max(200)
      .trim(),

    phone: z
      .string(),

    city: z
      .string()
      .min(2)
      .max(50)
      .trim(),
  }),
});