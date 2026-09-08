import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";

import {
  addProductToWishlist,
  clearWishlistService,
  getAllWishlistsService,
  getMyWishlistService,
  getWishlistStatsService,
  removeProductFromWishlist,
} from "../services/wishlist.service.js";

interface WishlistParams {
  productId: string;
}

const getUserId = (
  req: Parameters<RequestHandler>[0],
): string => {
  if (!req.user?.id) {
    throw new ApiError(
      "Unauthorized access",
      401,
    );
  }

  return req.user.id;
};

export const addToWishlist: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      productId,
    } =
      req.params as unknown as WishlistParams;

    const {
      wishlist,
      created,
    } =
      await addProductToWishlist(
        getUserId(req),
        productId,
      );

    return sendResponse(
      res,
      created ? 201 : 200,
      "Product added to wishlist successfully",
      {
        wishlist,
      },
    );
  });

export const getMyWishlist: RequestHandler =
  asyncHandler(async (req, res) => {
    const wishlist =
      await getMyWishlistService(
        getUserId(req),
      );

    return sendResponse(
      res,
      200,
      wishlist
        ? "Wishlist retrieved successfully"
        : "Wishlist is empty",
      {
        totalProducts:
          wishlist?.products.length ?? 0,

        wishlist,
      },
    );
  });

export const removeFromWishlist: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      productId,
    } =
      req.params as unknown as WishlistParams;

    const wishlist =
      await removeProductFromWishlist(
        getUserId(req),
        productId,
      );

    return sendResponse(
      res,
      200,
      "Product removed from wishlist successfully",
      {
        wishlist,
      },
    );
  });

export const clearWishlist: RequestHandler =
  asyncHandler(async (req, res) => {
    await clearWishlistService(
      getUserId(req),
    );

    return sendResponse(
      res,
      200,
      "Wishlist cleared successfully",
      {
        wishlist: {
          products: [],
        },

        totalProducts: 0,
      },
    );
  });

export const getAllWishlists: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
    } = req.query as {
      page?: string | number;
      limit?: string | number;
    };

    const result =
      await getAllWishlistsService(
        page,
        limit,
      );

    return sendResponse(
      res,
      200,
      "Wishlists retrieved successfully",
      result,
    );
  });

export const getWishlistStats: RequestHandler =
  asyncHandler(async (_req, res) => {
    const statistics =
      await getWishlistStatsService();

    return sendResponse(
      res,
      200,
      "Wishlist statistics retrieved successfully",
      {
        statistics,
      },
    );
  });