import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendRes.js";
import ApiError from "../utils/apiError.js";

import {
  createUser,
  getUserById as getUserByIdService,
  getAllUsers as getAllUsersService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "../services/user.service.js";

const getUserIdParam = (req: Parameters<RequestHandler>[0]): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new ApiError("Invalid user id", 400);
  }

  return id;
};

export const addUser: RequestHandler =
  asyncHandler(async (req, res) => {
    const user = await createUser(
      req.body,
    );

    return sendResponse(
      res,
      201,
      "User created successfully",
      {
        user,
      },
    );
  });

export const getUserById: RequestHandler =
  asyncHandler(async (req, res) => {
    const id = getUserIdParam(req);

    const user =
      await getUserByIdService(id);

    return sendResponse(
      res,
      200,
      "User retrieved successfully",
      {
        user,
      },
    );
  });

export const updateUser: RequestHandler =
  asyncHandler(async (req, res) => {
    const id = getUserIdParam(req);

    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        401,
      );
    }

    if (
      req.user.id !== id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        "You are not allowed to update this profile",
        403,
      );
    }

    const user =
      await updateUserService(
        id,
        req.body,
      );

    return sendResponse(
      res,
      200,
      "User updated successfully",
      {
        user,
      },
    );
  });

export const getAllUsers: RequestHandler =
  asyncHandler(async (req, res) => {
    const users =
      await getAllUsersService();

    return sendResponse(
      res,
      200,
      "Users fetched successfully",
      {
        count: users.length,
        users,
      },
    );
  });

export const deleteUser: RequestHandler =
  asyncHandler(async (req, res) => {
    const id = getUserIdParam(req);

    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        401,
      );
    }

    if (req.user.id === id) {
      throw new ApiError(
        "Admin cannot delete their own account",
        403,
      );
    }

    await deleteUserService(id);

    return sendResponse(
      res,
      200,
      "User deleted successfully",
    );
  });