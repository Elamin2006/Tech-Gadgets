import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

const authentication: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new ApiError("Unauthorized", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as jwt.JwtPayload;

    const userId = decoded.userId;

    if (!userId) {
      return next(new ApiError("Invalid token", 401));
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return next(
        new ApiError(
          "The user belonging to this token no longer exists.",
          401,
        ),
      );
    }

if (!currentUser.role) {
  return next(new ApiError("User role is missing", 401));
}

req.user = {
  id: currentUser._id.toString(),
  role: currentUser.role,
};

    next();
  } catch {
    next(
      new ApiError(
        "Invalid token or token has expired. Please login again.",
        401,
      ),
    );
  }
};

export default authentication;