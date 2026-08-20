import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";

import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";
import type { UserRole } from "../../types/auth.types.js";

interface UpdateUserRoleBody {
  role: UserRole;
}

interface ToggleUserBanBody {
  isBanned: boolean;
}

export const getAllUsers: RequestHandler = asyncHandler(async (req, res, next) => {
    
      const page =
        typeof req.query.page === "string"
          ? Number(req.query.page)
          : 1;

      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 10;

      const role =
        typeof req.query.role === "string"
          ? req.query.role
          : undefined;

      const query = role
        ? { role }
        : {};

      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalUsers =
        await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          totalPages:
            Math.ceil(
              totalUsers / limit,
            ),
          totalUsers,
        },
      });
    
  });

export const getUserById: RequestHandler = asyncHandler(async (req, res, next) => {
   
      const user =
        await User.findById(
          req.params.id,
        ).select("-password");

      if (!user) {
        throw new ApiError(
          "User not found",
          404,
        );
      }

      res.status(200).json({
        success: true,
        data: user,
      });
   
  });

export const updateUserRole: RequestHandler = asyncHandler(async (req, res, next) => {
    
      const { role } =
        req.body as UpdateUserRoleBody;

      const user =
        await User.findById(
          req.params.id,
        );

      if (!user) {
        throw new ApiError(
          "User not found",
          404,
        );
      }

      if (
        role !== "user" &&
        role !== "admin"
      ) {
        throw new ApiError(
          "Invalid role",
          400,
        );
      }

      user.role = role;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "User role updated successfully",
        data: user,
      });
    
  });

export const toggleUserBanStatus: RequestHandler = asyncHandler(async (req, res, next) => {
    
      const { isBanned } =
        req.body as ToggleUserBanBody;

      const user =
        await User.findById(
          req.params.id,
        );

      if (!user) {
        throw new ApiError(
          "User not found",
          404,
        );
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

export const deleteUserAccount: RequestHandler = asyncHandler(async (req, res, next) => {
    
      const user =
        await User.findById(
          req.params.id,
        );

      if (!user) {
        throw new ApiError(
          "User not found",
          404,
        );
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "User deleted successfully",
      });
    
  });