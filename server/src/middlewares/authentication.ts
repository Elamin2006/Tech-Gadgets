import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import config from "../config/env.js";

const authentication: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    let token: string | undefined;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (
      !token &&
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(
        "Unauthorized, no token provided",
        401,
      );
    }

    const decoded = jwt.verify(
      token,
      config.ACCESS_TOKEN_SECRET,
    ) 

    if (typeof decoded === "string" || !decoded.userId) {
  throw new ApiError("Invalid token", 401);
}

    if (!decoded.userId) {
      throw new ApiError("Invalid token", 401);
    }

    const currentUser = await User.findById(decoded.userId);

    if (!currentUser) {
      throw new ApiError(
        "The user belonging to this token no longer exists.",
        401,
      );
    }

    if (!currentUser.role) {
      throw new ApiError("User role is missing", 401);
    }

    req.user = {
      id: currentUser._id.toString(),
      role: currentUser.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(
      new ApiError(
        "Invalid token or token has expired. Please login again.",
        401,
      ),
    );
  }
};

export default authentication;