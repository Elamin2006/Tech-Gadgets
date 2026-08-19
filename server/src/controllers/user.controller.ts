import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import {
  generateResetCode,
  buildResetMailOptions,
  sendMail,
} from "../services/email.js";
import type { IUser } from "../models/user.model.js";
import type { HydratedDocument } from "mongoose";

type UserDocument = HydratedDocument<IUser>;

interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface VerifyResetCodeBody {
  email: string;
  resetCode: string;
}

interface ResetPasswordBody {
  email: string;
  newPassword: string;
}

const generateAccessToken = (user: UserDocument): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: "1d" },
  );
};

export const register: RequestHandler = asyncHandler(async (req, res, next) => {
  const user = req.body as RegisterBody;

    const userExists = await User.findOne({
      email: user.email,
    });

    if (userExists) {
      throw new ApiError(
        "User with this email already exists",
        409,
      );
    }

    const newUser = new User({
      ...user,
      createdAt: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser.toObject(),
    });

});

export const login: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body as LoginBody;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(
        "Invalid email or password",
        400,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ApiError(
        "Invalid email or password",
        400,
      );
    }

    const token = generateAccessToken(user);
  const userResponse = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userResponse,
    });
 
});

export const forgotPassword: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const { email } =
      req.body as ForgotPasswordBody;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(
        "No user with this email",
        404,
      );
    }

    const resetCode = generateResetCode();

    user.passwordResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    user.passwordResetExpires = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    user.passwordResetVerified = false;

    await user.save();

    await sendMail(
      buildResetMailOptions(email, resetCode),
    );

    res.status(200).json({
      success: true,
      message: "Password reset code sent to email",
    });
 
});

export const verifyResetCode: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const { email, resetCode } =
      req.body as VerifyResetCodeBody;

    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    const user = await User.findOne({
      email,
      passwordResetCode: hashedResetCode,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      throw new ApiError(
        "Reset code is invalid or has expired",
        400,
      );
    }

    user.passwordResetVerified = true;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Reset code verified successfully",
    });
  
});

export const resetPassword: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const { email, newPassword } =
      req.body as ResetPasswordBody;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(
        "User not found",
        404,
      );
    }

    if (!user.passwordResetVerified) {
      throw new ApiError(
        "Reset code not verified yet",
        400,
      );
    }

    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = false;

    await user.save();

    const token = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      token,
    });
  
});