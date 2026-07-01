import express from "express";
import {
  addToCart,
  getLoggedUserCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../Controllers/cart.controller.js";

import authentication from "../Middlewares/authentication.js";

import validatorMiddleware from "../Middlewares/validation.middleware.js";
import {
  addToCartSchema,
  updateCartItemQuantitySchema,
} from "../validations/cart.validation.js";

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
