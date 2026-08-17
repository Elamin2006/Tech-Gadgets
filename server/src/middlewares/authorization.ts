import type { RequestHandler } from "express";

import type { UserRole } from "../types/auth.types.js";
import ApiError from "../utils/apiError.js";

export const allowedTo = (
  ...roles: UserRole[]
): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          "You do not have permission to perform this action",
          403,
        ),
      );
    }

    next();
  };
};