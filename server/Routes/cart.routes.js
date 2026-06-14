import express from "express";
import {
    addToCart,
    getLoggedUserCart,
    removeFromCart,
    clearCart
} from "../Controllers/cart.controller.js";

import authentication from "../Middlewares/authentication.js";

import validatorMiddleware from "../Middlewares/validation.middleware.js";
import { addToCartSchema } from "../validations/cart.validation.js";

const cartRouter = express.Router();

cartRouter.use(authentication); 

cartRouter.route("/")
    .get(getLoggedUserCart)
    .post(validatorMiddleware(addToCartSchema), addToCart)
    .delete(clearCart);
cartRouter.route("/removeItem")
    .delete(removeFromCart);

export default cartRouter;