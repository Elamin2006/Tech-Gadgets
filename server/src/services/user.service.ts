import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const createUser = async (data: {
  username: string;
  email: string;
  password: string;
  phone: string;
}) => {
  const email = data.email.toLowerCase();

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new ApiError(
      "Email already registered",
      409,
    );
  }

  const user = await User.create({
    ...data,
    email,
    isVerified: true,
    role: "customer",
  });

  const { password: _password, ...userData } = user.toObject();

  return userData;
};

export const getUserById = async (
  userId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  return user;
};

export const getAllUsers = async () => {
  return User.find()
    .sort({ createdAt: -1 });
};

export const updateUser = async (
  userId: string,
  data: {
    username?: string;
    phone?: string;
    avatar?: string;
  },
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  if (data.username !== undefined) {
    user.username = data.username;
  }

  if (data.phone !== undefined) {
    user.phone = data.phone;
  }

  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
  }

  await user.save();

  const { password: _password, ...userData } = user.toObject();

  return userData;
};

export const deleteUser = async (
  userId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  await user.deleteOne();
};