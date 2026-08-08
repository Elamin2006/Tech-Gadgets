import express from "express";
import {
  addToCart,
  getLoggedUserCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

import authentication from "../middlewares/authentication.js";

import validatorMiddleware from "../middlewares/validation.middleware.js";
import {
  addToCartSchema,
  updateCartItemQuantitySchema,
} from "../validators/cart.validation.js";

const cartRouter = express.Router();

cartRouter.use(authentication);

cartRouter
  .route("/")
  .get(getLoggedUserCart)
  .post(validatorMiddleware(addToCartSchema), addToCart)
  .delete(clearCart);
cartRouter
  .route("/:itemId")
  .patch(
    validatorMiddleware(updateCartItemQuantitySchema),
    updateCartItemQuantity,
  )
  .delete(removeFromCart);

export default cartRouter;
