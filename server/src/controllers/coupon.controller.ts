import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";

import Coupon from "../models/coupon.model.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";

export const createCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);

  sendResponse(res, 201, "Coupon created successfully", { coupon });
});

export const getAllCoupons: RequestHandler = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  sendResponse(res, 200, "Coupons retrieved successfully", { coupons });
});

export const updateCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError("Coupon not found", 404);
  }

  Object.assign(coupon, req.body);
  await coupon.save();

  sendResponse(res, 200, "Coupon updated successfully", { coupon });
});

export const deleteCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    throw new ApiError("Coupon not found", 404);
  }

  sendResponse(res, 200, "Coupon deleted successfully");
});
