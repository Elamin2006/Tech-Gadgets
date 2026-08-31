import express from "express";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validationMiddleware from "../middlewares/validation.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";
import {
  couponIdSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../validators/coupon.validation.js";

const couponRouter = express.Router();

couponRouter.use(authentication, allowedTo("admin"));

couponRouter
  .route("/")
  .get(getAllCoupons)
  .post(validationMiddleware(createCouponSchema), createCoupon);

couponRouter
  .route("/:id")
  .patch(
    validationMiddleware(couponIdSchema, "params"),
    validationMiddleware(updateCouponSchema),
    updateCoupon,
  )
  .delete(validationMiddleware(couponIdSchema, "params"), deleteCoupon);

export default couponRouter;
