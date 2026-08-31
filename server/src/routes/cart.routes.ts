import express from "express";

import {
  addToCart,
  applyCoupon,
  clearCart,
  getLoggedUserCart,
  removeCoupon,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import authentication from "../middlewares/authentication.js";
import validationMiddleware from "../middlewares/validation.middleware.js";
import {
  addToCartSchema,
  applyCouponSchema,
  updateCartItemQuantitySchema,
} from "../validators/cart.validation.js";

const cartRouter = express.Router();

cartRouter.use(authentication);

cartRouter
  .route("/")
  .get(getLoggedUserCart)
  .post(validationMiddleware(addToCartSchema), addToCart)
  .delete(clearCart);

cartRouter.post(
  "/coupon",
  validationMiddleware(applyCouponSchema),
  applyCoupon,
);

cartRouter.delete("/coupon", removeCoupon);

cartRouter
  .route("/:itemId")
  .patch(
    validationMiddleware(updateCartItemQuantitySchema),
    updateCartItemQuantity,
  )
  .delete(removeFromCart);

export default cartRouter;
