import mongoose from "mongoose";
import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../services/cloudinary.js";

import {
  addPriceFilter,
  addRegexFilter,
  addTagsFilter,
  getPagination,
  getSortQuery,
} from "../utils/helpers.js";

interface ProductQuery {
  search?: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

interface CreateProductBody {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku?: string;
  categoryId: string;
  subcategory?: string;
  brand?: string;
  tags?: string;
  featured?: boolean;
  isActive?: boolean;
}

interface UpdateProductBody
  extends Partial<CreateProductBody> {
  deletedImages?: string;
}

const parseTags = (
  tags?: string,
): string[] => {
  if (!tags) {
    return [];
  }

  try {
    const parsed = JSON.parse(tags);

    if (Array.isArray(parsed)) {
      return parsed
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean);
    }
  } catch {
  }

  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
};

const parseDeletedImages = (
  deletedImages?: string,
): string[] => {
  if (!deletedImages) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      deletedImages,
    );

    if (!Array.isArray(parsed)) {
      throw new ApiError(
        "deletedImages must be a valid JSON array",
        400,
      );
    }

    return parsed.filter(
      (id): id is string =>
        typeof id === "string" &&
        id.trim().length > 0,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "deletedImages must be a valid JSON array",
      400,
    );
  }
};

/**
 * GET /products
 */
export const getAllProducts: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      sort,
      search,
    } =
      req.query as ProductQuery;

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    addRegexFilter(
      filter,
      "brand",
      brand,
    );

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    addPriceFilter(
      filter,
      minPrice,
      maxPrice,
    );

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const {
      currentPage,
      limitPerPage,
      skip,
    } = getPagination(page, limit);

    const sortQuery =
      getSortQuery(sort);

    const [
      totalProducts,
      products,
    ] = await Promise.all([
      Product.countDocuments(filter),

      Product.find(filter)
        .populate(
          "categoryId",
          "name",
        )
        .sort(sortQuery)
        .skip(skip)
        .limit(limitPerPage)
        .lean(),
    ]);

    return sendResponse(
      res,
      200,
      "Products retrieved successfully",
      {
        totalProducts,
        currentPage,
        totalPages: Math.ceil(
          totalProducts /
            limitPerPage,
        ),
        products,
      },
    );
  });

/**
 * GET /products/search
 */
export const searchProducts: RequestHandler =
  asyncHandler(async (req, res) => {
    const {
      search,
      categoryId,
      subcategory,
      brand,
      tags,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } =
      req.query as ProductQuery;

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (categoryId) {
      filter.categoryId =
        categoryId;
    }

    addRegexFilter(
      filter,
      "subcategory",
      subcategory,
    );

    addRegexFilter(
      filter,
      "brand",
      brand,
    );

    addTagsFilter(
      filter,
      tags,
    );

    addPriceFilter(
      filter,
      minPrice,
      maxPrice,
    );

    const {
      currentPage,
      limitPerPage,
      skip,
    } = getPagination(page, limit);

    const products =
      await Product.find(filter)
        .populate(
          "categoryId",
          "name",
        )
        .sort(getSortQuery(sort))
        .skip(skip)
        .limit(limitPerPage)
        .lean();

    const totalProducts =
      await Product.countDocuments(
        filter,
      );

    return sendResponse(
      res,
      200,
      "Products fetched successfully",
      {
        totalProducts,
        currentPage,
        totalPages: Math.ceil(
          totalProducts /
            limitPerPage,
        ),
        products,
      },
    );
  });

/**
 * GET /products/:id
 */
export const getProductById: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      )
        .populate(
          "categoryId",
          "name",
        )
        .populate(
          "createdBy",
          "username email avatar",
        );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    return sendResponse(
      res,
      200,
      "Product retrieved successfully",
      {
        product,
      },
    );
  });

/**
 * GET /products/:id/reviews
 */
export const getProductReviews: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      ).select(
        "reviews averageRating numReviews",
      );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    return sendResponse(
      res,
      200,
      "Reviews retrieved successfully",
      {
        averageRating:
          product.averageRating,

        numReviews:
          product.numReviews,

        reviews:
          product.reviews,
      },
    );
  });

/**
 * POST /products
 */
export const createProduct: RequestHandler =
  asyncHandler(async (req, res) => {
    const body =
      req.body as CreateProductBody;

    if (
      !req.files ||
      !Array.isArray(req.files) ||
      req.files.length === 0
    ) {
      throw new ApiError(
        "At least one product image is required",
        400,
      );
    }

    const category =
      await Category.findById(
        body.categoryId,
      );

    if (!category) {
      throw new ApiError(
        "Category not found",
        404,
      );
    }

    const files =
      req.files as Express.Multer.File[];

    const uploadedImages =
      await Promise.all(
        files.map((file) =>
          uploadToCloudinary(
            file,
            "tech_gadgets/products",
          ),
        ),
      );

    try {
      const product =
        await Product.create({
          createdBy: req.user!.id,

          name: body.name,
          shortDescription:
            body.shortDescription,
          description:
            body.description,

          price: body.price,
          discountPrice:
            body.discountPrice ?? 0,

          stock: body.stock,

          sku: body.sku,

          images: uploadedImages,

          categoryId:
            body.categoryId,

          subcategory:
            body.subcategory,

          brand: body.brand,

          tags: parseTags(
            body.tags,
          ),

          featured:
            body.featured ?? false,

          isActive:
            body.isActive ?? true,
        });

      return sendResponse(
        res,
        201,
        "Product created successfully",
        {
          product,
        },
      );
    } catch (error) {
      await Promise.allSettled(
        uploadedImages.map(
          (image) =>
            deleteFromCloudinary(
              image.publicId,
            ),
        ),
      );

      throw error;
    }
  });

/**
 * PATCH /products/:id
 */
export const updateProduct: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    const body =
      req.body as UpdateProductBody;

    if (body.categoryId) {
      const category =
        await Category.findById(
          body.categoryId,
        );

      if (!category) {
        throw new ApiError(
          "Category not found",
          404,
        );
      }

      product.categoryId =
        category._id;
    }

    if (body.name !== undefined) {
      product.name =
        body.name;
    }

    if (
      body.shortDescription !==
      undefined
    ) {
      product.shortDescription =
        body.shortDescription;
    }

    if (
      body.description !==
      undefined
    ) {
      product.description =
        body.description;
    }

    if (body.price !== undefined) {
      product.price =
        body.price;
    }

    if (
      body.discountPrice !==
      undefined
    ) {
      product.discountPrice =
        body.discountPrice;
    }

    if (body.stock !== undefined) {
      product.stock =
        body.stock;
    }

    if (body.sku !== undefined) {
      product.sku =
        body.sku;
    }

    if (
      body.subcategory !==
      undefined
    ) {
      product.subcategory =
        body.subcategory;
    }

    if (body.brand !== undefined) {
      product.brand =
        body.brand;
    }

    if (body.tags !== undefined) {
      product.tags =
        parseTags(body.tags);
    }

    if (
      body.featured !== undefined
    ) {
      product.featured =
        body.featured;
    }

    if (
      body.isActive !== undefined
    ) {
      product.isActive =
        body.isActive;
    }

    const uploadedImages: {
      publicId: string;
      url: string;
    }[] = [];

    if (
      req.files &&
      Array.isArray(req.files) &&
      req.files.length > 0
    ) {
      const files =
        req.files as Express.Multer.File[];

      const newImages =
        await Promise.all(
          files.map((file) =>
            uploadToCloudinary(
              file,
              "tech_gadgets/products",
            ),
          ),
        );

      uploadedImages.push(
        ...newImages,
      );

      product.images.push(
        ...newImages,
      );
    }

    const imagesToDelete =
      parseDeletedImages(
        body.deletedImages,
      );

    for (const publicId of imagesToDelete) {
      const imageExists =
        product.images.some(
          (image) =>
            image.publicId ===
            publicId,
        );

      if (!imageExists) {
        continue;
      }

      await deleteFromCloudinary(
        publicId,
      );

      product.images =
        product.images.filter(
          (image) =>
            image.publicId !==
            publicId,
        );
    }

    if (
      product.images.length === 0
    ) {
      throw new ApiError(
        "Product must have at least one image",
        400,
      );
    }

    if (
  (product.discountPrice ?? 0) >
  product.price
) {
  throw new ApiError(
    "Discount price cannot exceed product price",
    400,
  );
}

    try {
      await product.save();
    } catch (error) {
      if (uploadedImages.length) {
        await Promise.allSettled(
          uploadedImages.map(
            (image) =>
              deleteFromCloudinary(
                image.publicId,
              ),
          ),
        );
      }

      throw error;
    }

    return sendResponse(
      res,
      200,
      "Product updated successfully",
      {
        product,
      },
    );
  });

/**
 * DELETE /products/:id
 */
export const deleteProduct: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    await Promise.all(
      product.images.map(
        (image) =>
          deleteFromCloudinary(
            image.publicId,
          ),
      ),
    );

    await product.deleteOne();

    return sendResponse(
      res,
      200,
      "Product deleted successfully",
    );
  });

/**
 * POST /products/:id/reviews
 */
export const addReview: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    const alreadyReviewed =
      product.reviews.some(
        (review) =>
          review.user.toString() ===
          req.user!.id,
      );

    if (alreadyReviewed) {
      throw new ApiError(
        "You have already reviewed this product",
        400,
      );
    }

    const review = {
      user: new mongoose.Types.ObjectId(
        req.user!.id,
      ),
      username:
        req.body.username ??
        "Customer",
      rating: req.body.rating,
      comment:
        req.body.comment,
    };

    product.reviews.push(
      review,
    );

    product.calcAverageRating();

    await product.save();

    return sendResponse(
      res,
      201,
      "Review added successfully",
      {
        review,
        averageRating:
          product.averageRating,
        numReviews:
          product.numReviews,
      },
    );
  });

/**
 * DELETE /products/:id/reviews/:reviewId
 */
export const deleteReview: RequestHandler =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id,
      );

    if (!product) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

   const reviewIndex =
  product.reviews.findIndex(
    (review) =>
      review._id?.toString() ===
      req.params.reviewId,
  );

if (reviewIndex === -1) {
  throw new ApiError(
    "Review not found",
    404,
  );
}

const review =
  product.reviews[reviewIndex];

const isOwner =
  review.user.toString() ===
  req.user!.id;

const isAdmin =
  req.user!.role === "admin";

if (
  !isOwner &&
  !isAdmin
) {
  throw new ApiError(
    "You are not authorized to delete this review",
    403,
  );
}

product.reviews.splice(
  reviewIndex,
  1,
);

product.calcAverageRating();

await product.save();

    return sendResponse(
      res,
      200,
      "Review deleted successfully",
      {
        averageRating:
          product.averageRating,
        numReviews:
          product.numReviews,
      },
    );
  });