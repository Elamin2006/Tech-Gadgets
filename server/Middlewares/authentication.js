import asyncHandler from "express-async-handler";
import apiError from "../Utils/ApiError.js";
import User from "../Model/User.model.js";
import {promisify} from "util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const authentication = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new apiError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1]

    try {
    const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw new apiError('The user belonging to this token no longer exists.', 401);
    }

    req.user = currentUser;
    next();
  } catch (error) {
    throw new apiError('Invalid token or token has expired. Please login again.', 401);
  }
});

export default authentication;