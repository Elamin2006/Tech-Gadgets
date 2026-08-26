import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId",
  );

const booleanFromFormData = z
  .union([
    z.boolean(),

    z.string().transform((value) => {
      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      return value;
    }),
  ])
  .pipe(z.boolean());

export const productIdSchema = z.object({
  id: objectIdSchema,
});

export const reviewIdSchema = z.object({
  id: objectIdSchema,
  reviewId: objectIdSchema,
});

export const createProductSchema = z
  .object({
    name: z
      .string({
        error: "Product name is required",
      })
      .min(3, "Product name must be at least 3 characters")
      .max(200, "Product name cannot exceed 200 characters")
      .trim(),

    shortDescription: z
      .string({
        error: "Short description is required",
      })
      .min(
        10,
        "Short description must be at least 10 characters",
      )
      .max(
        500,
        "Short description cannot exceed 500 characters",
      )
      .trim(),

    description: z
      .string({
        error: "Product description is required",
      })
      .min(
        10,
        "Product description must be at least 10 characters",
      )
      .trim(),

    price: z.coerce
      .number({
        error: "Product price must be a valid number",
      })
      .min(0, "Product price cannot be negative"),

    discountPrice: z.coerce
      .number({
        error: "Discount price must be a valid number",
      })
      .min(0, "Discount price cannot be negative")
      .optional(),

    stock: z.coerce
      .number({
        error: "Stock must be a valid number",
      })
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),

    sku: z
      .string()
      .trim()
      .optional(),

    categoryId: objectIdSchema,

    subcategory: z
      .string()
      .trim()
      .optional(),

    brand: z
      .string()
      .trim()
      .optional(),

    tags: z
      .string()
      .optional(),

    featured: booleanFromFormData.optional(),

    isActive: booleanFromFormData.optional(),
  })
  .refine(
    (data) =>
      data.discountPrice === undefined ||
      data.discountPrice <= data.price,
    {
      message: "Discount price cannot exceed product price",
      path: ["discountPrice"],
    },
  );

export const updateProductSchema = z
  .object({
    name: z
      .string({
        error: "Product name must be a string",
      })
      .min(3, "Product name must be at least 3 characters")
      .max(200, "Product name cannot exceed 200 characters")
      .trim()
      .optional(),

    shortDescription: z
      .string({
        error: "Short description must be a string",
      })
      .min(
        10,
        "Short description must be at least 10 characters",
      )
      .max(
        500,
        "Short description cannot exceed 500 characters",
      )
      .trim()
      .optional(),

    description: z
      .string({
        error: "Product description must be a string",
      })
      .min(
        10,
        "Product description must be at least 10 characters",
      )
      .trim()
      .optional(),

    price: z.coerce
      .number({
        error: "Product price must be a valid number",
      })
      .min(0, "Product price cannot be negative")
      .optional(),

    discountPrice: z.coerce
      .number({
        error: "Discount price must be a valid number",
      })
      .min(0, "Discount price cannot be negative")
      .optional(),

    stock: z.coerce
      .number({
        error: "Stock must be a valid number",
      })
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
      .optional(),

    sku: z
      .string()
      .trim()
      .optional(),

    categoryId: objectIdSchema.optional(),

    subcategory: z
      .string()
      .trim()
      .optional(),

    brand: z
      .string()
      .trim()
      .optional(),

    tags: z
      .string()
      .optional(),

    featured: booleanFromFormData.optional(),

    isActive: booleanFromFormData.optional(),

    deletedImages: z
      .string()
      .optional(),
  })
  .refine(
    (data) =>
      data.price === undefined ||
      data.discountPrice === undefined ||
      data.discountPrice <= data.price,
    {
      message: "Discount price cannot exceed product price",
      path: ["discountPrice"],
    },
  );

export const addReviewSchema = z.object({
  rating: z.coerce
    .number({
      error: "Rating must be a valid number",
    })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  comment: z
    .string({
      error: "Review comment must be a string",
    })
    .trim()
    .max(
      1000,
      "Review comment cannot exceed 1000 characters",
    )
    .optional(),
});

export const productSearchSchema = z
  .object({
    search: z
      .string({
        error: "Search term must be a string",
      })
      .trim()
      .optional(),

    categoryId: objectIdSchema.optional(),

    subcategory: z
      .string({
        error: "Subcategory must be a string",
      })
      .trim()
      .optional(),

    brand: z
      .string({
        error: "Brand must be a string",
      })
      .trim()
      .optional(),

    tags: z
      .string({
        error: "Tags must be a string",
      })
      .trim()
      .optional(),

    minPrice: z.coerce
      .number({
        error: "Minimum price must be a valid number",
      })
      .min(0, "Minimum price cannot be negative")
      .optional(),

    maxPrice: z.coerce
      .number({
        error: "Maximum price must be a valid number",
      })
      .min(0, "Maximum price cannot be negative")
      .optional(),

    sort: z
      .enum(
        [
          "price_asc",
          "price_desc",
          "rating",
          "popular",
          "oldest",
        ],
        {
          error: "Invalid product sorting option",
        },
      )
      .optional(),

    page: z.coerce
      .number({
        error: "Page must be a valid number",
      })
      .int("Page must be a whole number")
      .min(1, "Page must be at least 1")
      .optional(),

    limit: z.coerce
      .number({
        error: "Limit must be a valid number",
      })
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.maxPrice >= data.minPrice,
    {
      message:
        "Maximum price must be greater than or equal to minimum price",
      path: ["maxPrice"],
    },
  );