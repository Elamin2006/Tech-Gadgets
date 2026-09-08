import mongoose from "mongoose";

import Product from "../models/product.model.js";
import Wishlist from "../models/wishlist.model.js";
import ApiError from "../utils/apiError.js";
import { getPagination } from "../utils/helpers.js";

const productProjection =
  "name price discountPercentage images stock isActive slug";

const getWishlistQuery = (userId: string) =>
  Wishlist.findOne({ userId }).populate(
    "products",
    productProjection,
  );

export const addProductToWishlist = async (
  userId: string,
  productId: string,
) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(
      "Product not found or inactive",
      404,
    );
  }

  let wishlist = await Wishlist.findOne({
    userId,
  });

  let created = false;

  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      products: [product._id],
    });

    created = true;
  } else {
    const alreadyExists =
      wishlist.products.some(
        (id) =>
          id.toString() === productId,
      );

    if (alreadyExists) {
      throw new ApiError(
        "Product already in wishlist",
        400,
      );
    }

    wishlist.products.push(product._id);

    await wishlist.save();
  }

  const populatedWishlist =
    await getWishlistQuery(userId);

  if (!populatedWishlist) {
    throw new ApiError(
      "Wishlist could not be retrieved after update",
      500,
    );
  }

  return {
    wishlist: populatedWishlist,
    created,
  };
};

export const getMyWishlistService = async (
  userId: string,
) => {
  return getWishlistQuery(userId);
};

export const removeProductFromWishlist =
  async (
    userId: string,
    productId: string,
  ) => {
    const wishlist =
      await Wishlist.findOne({
        userId,
      });

    if (!wishlist) {
      throw new ApiError(
        "Wishlist not found",
        404,
      );
    }

    const productExists =
      wishlist.products.some(
        (id) =>
          id.toString() === productId,
      );

    if (!productExists) {
      throw new ApiError(
        "Product not found in wishlist",
        404,
      );
    }

    wishlist.products =
      wishlist.products.filter(
        (id) =>
          id.toString() !== productId,
      );

    await wishlist.save();

    const populatedWishlist =
      await getWishlistQuery(userId);

    if (!populatedWishlist) {
      throw new ApiError(
        "Wishlist could not be retrieved after update",
        500,
      );
    }

    return populatedWishlist;
  };

export const clearWishlistService =
  async (userId: string) => {
    const wishlist =
      await Wishlist.findOne({
        userId,
      });

    if (!wishlist) {
      throw new ApiError(
        "Wishlist not found",
        404,
      );
    }

    wishlist.products = [];

    await wishlist.save();

    return wishlist;
  };

export const getAllWishlistsService =
  async (
    pageValue?: string | number,
    limitValue?: string | number,
  ) => {
    const {
      currentPage,
      limitPerPage,
      skip,
    } = getPagination(
      pageValue,
      limitValue,
    );

    const [
      totalWishlists,
      wishlists,
    ] = await Promise.all([
      Wishlist.countDocuments(),

      Wishlist.find()
        .populate(
          "userId",
          "username firstName lastName email",
        )
        .populate(
          "products",
          productProjection,
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitPerPage)
        .lean(),
    ]);

    return {
      totalWishlists,

      currentPage,

      totalPages: Math.ceil(
        totalWishlists /
          limitPerPage,
      ),

      wishlists,
    };
  };

export const getWishlistStatsService =
  async () => {
    const [
      totals,
      topProducts,
    ] = await Promise.all([
      Wishlist.aggregate<{
        totalWishlists: number;
        totalWishlistProducts: number;
      }>([
        {
          $group: {
            _id: null,

            totalWishlists: {
              $sum: 1,
            },

            totalWishlistProducts: {
              $sum: {
                $size: {
                  $ifNull: [
                    "$products",
                    [],
                  ],
                },
              },
            },
          },
        },
      ]),

      Wishlist.aggregate<{
        productId: mongoose.Types.ObjectId;
        count: number;
        name: string;
        image?: string;
      }>([
        {
          $unwind: "$products",
        },

        {
          $group: {
            _id: "$products",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },

        {
          $limit: 10,
        },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productData",
          },
        },

        {
          $unwind: "$productData",
        },

        {
          $project: {
            _id: 0,

            productId: "$_id",

            count: 1,

            name: "$productData.name",

            image: {
              $arrayElemAt: [
                "$productData.images.url",
                0,
              ],
            },
          },
        },
      ]),
    ]);

    const totalsResult =
      totals[0] ?? {
        totalWishlists: 0,
        totalWishlistProducts: 0,
      };

    return {
      totalWishlists:
        totalsResult.totalWishlists,

      totalWishlistProducts:
        totalsResult.totalWishlistProducts,

      topProducts,
    };
  };