import { z } from "zod";

const emailSchema = z
  .email("Email must be a valid email address")
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .trim()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
    "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
  );

export const userSchema = z.object({}).strict();

export const registerValidation = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters"),

    email: emailSchema,

    password: passwordSchema,
  })
  .strict();

export const loginValidation = z
  .object({
    email: emailSchema,

    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: emailSchema,

    otp: z
      .string()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const changeRoleSchema = z
  .object({
    userId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid User ID format (must be a valid MongoDB ObjectId)",
      ),

    role: z.enum(["admin", "customer"]),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    email: emailSchema,

    otp: z
      .string()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),

    newPassword: passwordSchema,
  })
  .strict();