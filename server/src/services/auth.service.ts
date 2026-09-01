import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import ApiError from "../utils/apiError.js";
import config from "../config/env.js";
import {
  buildResetMailOptions,
  buildRoleUpdateMailOptions,
} from "./emails.js";

import sendMail from "../utils/sendMail.js";
import type {
  IOTPUserData,
} from "../models/otp.model.js";
import type { UserRole } from "../types/auth.types.js";

const generateOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

const generateAccessToken = (
  userId: string,
  role: UserRole,
): string => {
  return jwt.sign(
    {
      userId,
      role,
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export const sendRegisterOTP = async (
  userData: IOTPUserData,
): Promise<void> => {
  const email = userData.email.toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      "Email already registered",
      409,
    );
  }

  const otp = generateOTP();

  const hashedOTP = await bcrypt.hash(
    otp,
    10,
  );

  const hashedPassword = await bcrypt.hash(
    userData.password,
    10,
  );

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  await OTP.deleteMany({ email });

  let otpDocument;

  try {
    otpDocument = await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt,
      userData: {
        ...userData,
        email,
        password: hashedPassword,
      },
    });

    await sendMail(
      buildResetMailOptions(email, otp),
    );
  } catch (error) {
    if (otpDocument) {
      await OTP.findByIdAndDelete(
        otpDocument._id,
      );
    }

    throw error;
  }
};

export const verifyRegistrationOTP = async (
  email: string,
  otp: string,
) => {
  const otpDocument = await OTP.findOne({
    email,
  });

  if (!otpDocument) {
    throw new ApiError(
      "Invalid or expired OTP",
      400,
    );
  }

  if (otpDocument.expiresAt < new Date()) {
    await OTP.deleteOne({
      _id: otpDocument._id,
    });

    throw new ApiError(
      "OTP has expired",
      400,
    );
  }

  if (!otpDocument.userData) {
    throw new ApiError(
      "Invalid OTP data",
      400,
    );
  }

  const isMatch = await bcrypt.compare(
    otp,
    otpDocument.otp,
  );

  if (!isMatch) {
    throw new ApiError(
      "Invalid OTP code",
      400,
    );
  }

  const user = new User({
    ...otpDocument.userData,
    isVerified: true,
    role: "customer",
  });

  user.$locals.passwordAlreadyHashed = true;

  await user.save();

  await OTP.deleteOne({
    _id: otpDocument._id,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(
      "Invalid email or password",
      401,
    );
  }

  const passwordMatch =
    await user.comparePassword(password);

  if (!passwordMatch) {
    throw new ApiError(
      "Invalid email or password",
      401,
    );
  }

  const token = generateAccessToken(
    user._id.toString(),
    user.role ?? "customer",
  );

  const { password: _password, ...userData } = user.toObject();

  return {
    token,
    user: userData,
  };
};

export const forgotPassword = async (
  email: string,
): Promise<void> => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  const otp = generateOTP();

  const hashedOTP = await bcrypt.hash(
    otp,
    10,
  );

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  await OTP.deleteMany({ email });

  let otpDocument;

  try {
    otpDocument = await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt,
      userData: null,
    });

    await sendMail(
      buildResetMailOptions(email, otp),
    );
  } catch (error) {
    if (otpDocument) {
      await OTP.findByIdAndDelete(
        otpDocument._id,
      );
    }

    throw error;
  }
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> => {
  const otpDocument = await OTP.findOne({
    email,
  });

  if (!otpDocument) {
    throw new ApiError(
      "Invalid or expired OTP code",
      400,
    );
  }

  if (otpDocument.expiresAt < new Date()) {
    await OTP.deleteOne({
      _id: otpDocument._id,
    });

    throw new ApiError(
      "OTP has expired",
      400,
    );
  }

  const otpMatch = await bcrypt.compare(
    otp,
    otpDocument.otp,
  );

  if (!otpMatch) {
    throw new ApiError(
      "Invalid or expired OTP code",
      400,
    );
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  user.password = newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  await OTP.deleteOne({
    _id: otpDocument._id,
  });
};

export const changeUserRole = async (
  userId: string,
  role: UserRole,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  if (user.role === role) {
    throw new ApiError(
      `User already has the role: ${role}`,
      400,
    );
  }

  const oldRole = user.role;

  user.role = role;

  await user.save();

  try {
  const mailOptions =
    buildRoleUpdateMailOptions(
      user.email,
      user.username,
      oldRole ?? "customer",
       role,
    );

  await sendMail(mailOptions);
} catch (error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown email error";

  console.error(
    "Role update email failed:",
    message,
  );
}

  return user;
};