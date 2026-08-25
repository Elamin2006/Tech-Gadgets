import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendRes.js";

import {
  sendRegisterOTP as sendRegisterOTPService,
  verifyRegistrationOTP,
  loginUser,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  changeUserRole,
} from "../services/auth.service.js";

export const sendRegisterOTP: RequestHandler =
  asyncHandler(async (req, res) => {
    await sendRegisterOTPService(req.body);

    return sendResponse(
      res,
      200,
      "OTP sent to your email successfully",
    );
  });

export const verifyOTP: RequestHandler =
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user =
      await verifyRegistrationOTP(
        email,
        otp,
      );

    const { password: _password, ...userData } =
      user.toObject();

    return sendResponse(
      res,
      201,
      "User registered and verified successfully",
      {
        user: userData,
      },
    );
  });

export const login: RequestHandler =
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { token, user } =
      await loginUser(
        email,
        password,
      );

    res.cookie(
      "accessToken",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      },
    );

    return sendResponse(
      res,
      200,
      "Login successful",
      {
        user,
      },
    );
  });

export const logout: RequestHandler =
  asyncHandler(async (_req, res) => {
    res.clearCookie("accessToken");

    return sendResponse(
      res,
      200,
      "Logged out successfully",
    );
  });

export const forgotPassword: RequestHandler =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    await forgotPasswordService(
      email,
    );

    return sendResponse(
      res,
      200,
      "OTP sent to your email successfully",
    );
  });

export const resetPassword: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    await resetPasswordService(
      email,
      otp,
      newPassword,
    );

    return sendResponse(
      res,
      200,
      "Password reset successfully",
    );
  });

export const changeRole: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      userId,
      role,
    } = req.body;

    const user =
      await changeUserRole(
        userId,
        role,
      );

    const {
      password: _password,
      ...userData
    } = user.toObject();

    return sendResponse(
      res,
      200,
      `User role updated successfully to ${role}`,
      {
        user: userData,
      },
    );
  });