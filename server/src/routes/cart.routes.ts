import express from "express";

import {
  addToCart,
  getLoggedUserCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../controllers/cart.controller.js";

import authentication from "../middlewares/authentication.js";

import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  addToCartSchema,
  updateCartItemSchema,
  cartProductIdSchema,
  applyCouponSchema,
} from "../validators/cart.validation.js";

const cartRouter = express.Router();

cartRouter.use(authentication);

cartRouter.get(
  "/",
  getLoggedUserCart,
);

cartRouter.post(
  "/items",
  validationMiddleware(addToCartSchema),
  addToCart,
);

cartRouter.patch(
  "/items",
  validationMiddleware(updateCartItemSchema),
  updateCartItemQuantity,
);

cartRouter.delete(
  "/items/:productId",
  validationMiddleware(
    cartProductIdSchema,
    "params",
  ),
  removeFromCart,
);

cartRouter.delete(
  "/clear",
  clearCart,
);

cartRouter.post(
  "/coupon",
  validationMiddleware(applyCouponSchema),
  applyCoupon,
);

cartRouter.delete(
  "/coupon",
  removeCoupon,
);

export default cartRouter;