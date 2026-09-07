import type { RequestHandler } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/sendRes.js";
import ApiError from "../../utils/apiError.js";

import type { UserRole } from "../../types/auth.types.js";

import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  updateUserRole as updateUserRoleService,
  toggleUserBanStatus as toggleUserBanStatusService,
  deleteUser as deleteUserService,
} from "../../services/user.service.js";

const getUserIdParam = (
  req: Parameters<RequestHandler>[0],
): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new ApiError(
      "Invalid user id",
      400,
    );
  }

  return id;
};

export const getAllUsers: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      role,
    } = req.query as {
      page?: number;
      limit?: number;
      role?: "admin" | "customer";
    };

    const result =
      await getAllUsersService({
        page,
        limit,
        role,
      });

    return sendResponse(
      res,
      200,
      "Users fetched successfully",
      {
        users: result.users,
        pagination:
          result.pagination,
      },
    );
  });

export const getUserById: RequestHandler =
  asyncHandler(async (req, res) => {
    const userId = getUserIdParam(req);

    const user =
      await getUserByIdService(userId);

    return sendResponse(
      res,
      200,
      "User retrieved successfully",
      {
        user,
      },
    );
  });


export const updateUserRole: RequestHandler =
  asyncHandler(async (req, res) => {
    const userId =  getUserIdParam(req);

    const { role } = req.body as {
      role: "admin" | "customer";
    };

    const user =
      await updateUserRoleService(
        userId,
        role,
      );

    return sendResponse(
      res,
      200,
      "User role updated successfully",
      {
        user,
      },
    );
  });


export const toggleUserBanStatus: RequestHandler =
  asyncHandler(async (req, res) => {
    const userId =  getUserIdParam(req);

    const { isBanned } =
      req.body as {
        isBanned: boolean;
      };

    const user =
      await toggleUserBanStatusService(
        userId,
        isBanned,
      );

    return sendResponse(
      res,
      200,
      isBanned
        ? "User suspended successfully"
        : "User reactivated successfully",
      {
        user,
      },
    );
  });


export const deleteUserAccount: RequestHandler =
  asyncHandler(async (req, res) => {
    const userId = getUserIdParam(req);

    if (
      !req.user ||
      req.user.id === userId
    ) {
      throw new ApiError(
        "Admin cannot delete their own account",
        403,
      );
    }

    await deleteUserService(userId);

    return sendResponse(
      res,
      200,
      "User deleted successfully",
    );
  });