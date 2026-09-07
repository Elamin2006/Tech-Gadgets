import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid user id");

const emailSchema = z
  .email("Email must be a valid email")
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .trim()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
    "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
  );

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[1-9]\d{7,14}$/,
    "Phone must be a valid international number",
  );

export const addUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters"),

    email: emailSchema,

    password: passwordSchema,

    phone: phoneSchema,
  })
  .strict();

export const userIdSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username cannot exceed 30 characters")
      .optional(),

    phone: phoneSchema.optional(),

    avatar: z
      .url("Avatar must be a valid URL")
      .trim()
      .optional(),
  })
  .strict();

export const adminUserRoleSchema = z
  .object({
    role: z.enum(
      ["admin", "customer"],
      {
        message:
          "Role must be either admin or customer",
      },
    ),
  })
  .strict();

  export const adminUserStatusSchema = z
  .object({
    isBanned: z.boolean({
      message:
        "isBanned must be a boolean",
    }),
  })
  .strict();

export const adminUsersQuerySchema = z
  .object({
    page: z.coerce
      .number({
        message: "Page must be a number",
      })
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),

    limit: z.coerce
      .number({
        message: "Limit must be a number",
      })
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(
        100,
        "Limit cannot exceed 100",
      )
      .default(10),

    role: z
      .enum(["admin", "customer"], {
        message:
          "Role must be either admin or customer",
      })
      .optional(),
  })
  .strict();

export const registerValidation = addUserSchema;

export const loginValidation = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();