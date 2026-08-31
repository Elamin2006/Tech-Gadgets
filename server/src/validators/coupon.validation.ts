import { z } from "zod";

const couponCodeSchema = z
  .string()
  .trim()
  .min(3, "Coupon code must be at least 3 characters")
  .max(30, "Coupon code cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Coupon code contains invalid characters",
  )
  .transform((value) => value.toUpperCase());

const couponTypeSchema = z.enum(["percentage", "fixed"]);

const couponValueSchema = z.coerce
  .number({ error: "Coupon value must be a valid number" })
  .positive("Coupon value must be greater than 0");

const booleanFromInput = z
  .union([
    z.boolean(),
    z.string().transform((value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    }),
  ])
  .pipe(z.boolean());

const couponFields = {
  code: couponCodeSchema,

  type: couponTypeSchema,

  value: couponValueSchema,

  minimumOrderAmount: z.coerce
    .number({ error: "Minimum order amount must be a valid number" })
    .min(0, "Minimum order amount cannot be negative")
    .default(0),

  maximumDiscount: z.coerce
    .number({ error: "Maximum discount must be a valid number" })
    .positive("Maximum discount must be greater than 0")
    .optional(),

  appliesToDiscountedProducts: booleanFromInput.default(true),

  isActive: booleanFromInput.default(true),

  expiresAt: z.coerce.date().optional(),

  usageLimit: z.coerce
    .number({ error: "Usage limit must be a valid number" })
    .int("Usage limit must be a whole number")
    .positive("Usage limit must be greater than 0")
    .optional(),
};

const percentageCouponRefinement = (
  data: {
    type?: "percentage" | "fixed";
    value?: number;
  },
  ctx: z.RefinementCtx,
) => {
  if (
    data.type === "percentage" &&
    data.value !== undefined &&
    data.value > 100
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["value"],
      message: "Percentage coupon cannot exceed 100%",
    });
  }
};

export const createCouponSchema = z
  .object(couponFields)
  .superRefine(percentageCouponRefinement);

export const updateCouponSchema = z
  .object(couponFields)
  .partial()
  .superRefine(percentageCouponRefinement);

export const couponIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID"),
});

export const applyCouponSchema = z.object({
  code: couponCodeSchema,
});