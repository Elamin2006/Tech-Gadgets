import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import type { UserRole } from "../types/auth.types.js";

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface UpdateUserData {
  username?: string;
  phone?: string;
  avatar?: string;
}

export interface GetAllUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
}

export interface GetAllUsersResult {
  users: unknown[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalUsers: number;
  };
}

export const createUser = async (data: CreateUserData
) => {
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
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  return user;
};

export const getAllUsers = async ({
  page = 1,
  limit = 10,
  role,
}: GetAllUsersOptions = {}): Promise<GetAllUsersResult> => {
  const query = role
    ? { role }
    : {};

  const skip =
    (page - 1) * limit;

  const [
    users,
    totalUsers,
  ] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      totalPages:
        Math.ceil(
          totalUsers / limit,
        ),
      totalUsers,
    },
  };
};

export const updateUser = async (
  userId: string,
  data:UpdateUserData
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

export const updateUserRole = async (
  userId: string,
  role: UserRole,
) => {
  
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      "User not found",
      404,
    );
  }

  user.role = role;

  await user.save();

  const {
    password: _password,
    ...userData
  } = user.toObject();

  return userData;
};

export const toggleUserBanStatus =
  async (
    userId: string,
    isBanned: boolean,
  ) => {
    const user =
      await User.findById(
        userId,
      );

    if (!user) {
      throw new ApiError(
        "User not found",
        404,
      );
    }

    user.isBanned =
      isBanned;

    await user.save();

    const {
      password: _password,
      ...userData
    } = user.toObject();

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