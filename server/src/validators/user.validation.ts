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

export const registerValidation = addUserSchema;

export const loginValidation = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();