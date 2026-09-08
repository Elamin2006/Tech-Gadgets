import express from "express";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  addToWishlist,
  clearWishlist,
  getAllWishlists,
  getMyWishlist,
  getWishlistStats,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import {
  wishlistPaginationSchema,
  wishlistProductIdSchema,
} from "../validators/wishlist.validation.js";

const wishlistRouter =
  express.Router();

wishlistRouter.use(authentication);

/*
 * Customer wishlist
 */

wishlistRouter.get(
  "/my",
  getMyWishlist,
);

wishlistRouter.post(
  "/add/:productId",

  validationMiddleware(
    wishlistProductIdSchema,
    "params",
  ),

  addToWishlist,
);

wishlistRouter.delete(
  "/remove/:productId",

  validationMiddleware(
    wishlistProductIdSchema,
    "params",
  ),

  removeFromWishlist,
);

wishlistRouter.delete(
  "/clear",
  clearWishlist,
);

/*
 * Admin wishlist management
 */

wishlistRouter.get(
  "/admin/all",

  allowedTo("admin"),

  validationMiddleware(
    wishlistPaginationSchema,
    "query",
  ),

  getAllWishlists,
);

wishlistRouter.get(
  "/admin/stats",

  allowedTo("admin"),

  getWishlistStats,
);

export default wishlistRouter;