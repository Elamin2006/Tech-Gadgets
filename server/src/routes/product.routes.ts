import express from "express";

import {
  addReview,
  createProduct,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getProductById,
  getProductReviews,
  searchProducts,
  updateProduct,
} from "../controllers/product.controller.js";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import uploadImage from "../middlewares/uploadImage.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  addReviewSchema,
  createProductSchema,
  productIdSchema,
  productSearchSchema,
  reviewIdSchema,
  updateProductSchema,
} from "../validators/product.validation.js";

const productRouter =
  express.Router();

/*
 * Public routes
 */

productRouter.get(
  "/",
  validationMiddleware(
    productSearchSchema,
    "query",
  ),
  getAllProducts,
);

productRouter.get(
  "/search",
  validationMiddleware(
    productSearchSchema,
    "query",
  ),
  searchProducts,
);

productRouter.get(
  "/:id/reviews",
  validationMiddleware(
    productIdSchema,
    "params",
  ),
  getProductReviews,
);

productRouter.get(
  "/:id",
  validationMiddleware(
    productIdSchema,
    "params",
  ),
  getProductById,
);

/*
 * Protected routes
 */

productRouter.use(
  authentication,
);

/*
 * Admin: create
 */

productRouter.post(
  "/",
  allowedTo("admin"),

  uploadImage.array(
    "images",
    5,
  ),

  validationMiddleware(
    createProductSchema,
    "body",
  ),

  createProduct,
);

/*
 * Admin: update
 */

productRouter.patch(
  "/:id",
  allowedTo("admin"),

  uploadImage.array(
    "images",
    5,
  ),

  validationMiddleware(
    productIdSchema,
    "params",
  ),

  validationMiddleware(
    updateProductSchema,
    "body",
  ),

  updateProduct,
);

/*
 * Customer/Admin: add review
 */

productRouter.post(
  "/:id/reviews",
  validationMiddleware(
    productIdSchema,
    "params",
  ),

  validationMiddleware(
    addReviewSchema,
    "body",
  ),

  addReview,
);

/*
 * Admin: delete product
 */

productRouter.delete(
  "/:id",
  allowedTo("admin"),

  validationMiddleware(
    productIdSchema,
    "params",
  ),

  deleteProduct,
);

/*
 * Customer/Admin: delete review
 */

productRouter.delete(
  "/:id/reviews/:reviewId",

  validationMiddleware(
    reviewIdSchema,
    "params",
  ),

  deleteReview,
);

export default productRouter;