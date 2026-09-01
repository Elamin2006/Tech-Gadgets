import { z } from "zod";

const orderStatuses = [
  "pending",
  "completed",
  "canceled",
] as const;

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

const paymentMethods = [
  "cash",
  "card",
] as const;

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    details: z
      .string({
        error: "Shipping details must be a string",
      })
      .trim()
      .min(
        5,
        "Shipping details must be at least 5 characters long",
      )
      .max(
        200,
        "Shipping details cannot exceed 200 characters",
      ),

    phone: z
      .string({
        error: "Phone number must be a string",
      })
      .trim()
      .min(5, "Phone number is required")
      .max(
        30,
        "Phone number cannot exceed 30 characters",
      ),

    city: z
      .string({
        error: "City must be a string",
      })
      .trim()
      .min(
        2,
        "City must be at least 2 characters long",
      )
      .max(
        50,
        "City cannot exceed 50 characters",
      ),
  }),

  paymentMethod: z
    .enum(paymentMethods)
    .default("cash"),

  customerNote: z
    .string({
      error: "Customer note must be a string",
    })
    .trim()
    .max(
      1000,
      "Customer note cannot exceed 1000 characters",
    )
    .optional()
    .default(""),
});

export const createCashOrderSchema =
  createOrderSchema;

export const getMyOrdersSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum(orderStatuses)
    .optional(),
});

export const getAllOrdersSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum(orderStatuses)
    .optional(),

  paymentStatus: z
    .enum(paymentStatuses)
    .optional(),

  from: z.coerce
    .date()
    .optional(),

  to: z.coerce
    .date()
    .optional(),

  sortBy: z
    .enum([
      "createdAt",
      "totalOrderPrice",
      "status",
      "paymentStatus",
    ])
    .default("createdAt"),

  sortDir: z
    .enum(["asc", "desc"])
    .default("desc"),
});

export const orderIdParamsSchema = z.object({
  orderId: z
    .string()
    .min(1, "Order ID is required"),
});

export const updateOrderStatusSchema = z
  .object({
    status: z
      .enum(orderStatuses)
      .optional(),

    isPaid: z
      .boolean()
      .optional(),

    isDelivered: z
      .boolean()
      .optional(),

    adminNote: z
      .string({
        error: "Admin note must be a string",
      })
      .trim()
      .max(
        1000,
        "Admin note cannot exceed 1000 characters",
      )
      .optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.isPaid !== undefined ||
      value.isDelivered !== undefined ||
      value.adminNote !== undefined,
    {
      message:
        "At least one order field must be provided",
    },
  );