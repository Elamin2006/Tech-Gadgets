import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendRes.js";
import ApiError from "../utils/apiError.js";

import {
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from "../services/user.service.js";


const getUserIdParam = (req: Parameters<RequestHandler>[0]): string => {
  const { id } = req.params;

  if (typeof id !== "string" ||!id.trim()) {
    throw new ApiError("Invalid user id", 400);
  }

  return id;
};


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

