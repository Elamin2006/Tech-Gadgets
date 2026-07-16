import asyncHandler from "express-async-handler";
import User from "../../Model/User.model.js";
import ApiError from "../../Utils/apiError.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const query = role ? { role } : {};

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalUsers = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalUsers / Number(limit)),
      totalUsers,
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["user", "admin"].includes(role)) {
    throw new ApiError("Invalid role", 400);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});

export const toggleUserBanStatus = asyncHandler(async (req, res) => {
  const { isBanned } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  user.isBanned = Boolean(isBanned);
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBanned
      ? "User suspended successfully"
      : "User reactivated successfully",
    data: user,
  });
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
