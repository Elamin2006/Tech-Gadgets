import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import { deleteImage } from "../services/cloudinary.js";

// 1. Create Product
export const createProduct = asyncHandler(async (req, res, next) => {
  const product = req.body;

  const category = await Category.findById(product.categoryId);
  if (!category) {
    throw new ApiError(`No Category Found With This ID: ${product.categoryId}`, 404);
  }

  const productData = {
    userId: req.user?._id,
    categoryId: category._id,
    name: product.name,
    description: product.description,
    price: product.price,
    discount: product.discount || 0,
    quantity: product.quantity || 1,
    image: req.file ? req.file.path : undefined,
  };

  if (!productData.image) {
    throw new ApiError("Product image is required", 400);
  }

  const newProduct = await Product.create(productData);
  res.status(201).json({ status: "success", data: newProduct });
});

// Get All Products
export const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find().populate("categoryId", "name");

  res
    .status(200)
    .json({ status: "success", results: products.length, data: products });
});

// Get Product By ID
export const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("categoryId", "name");

  if (!product) {
    throw new ApiError(`No Product Found With This ID: ${id}`, 404);
  }

  res.status(200).json({ status: "success", data: product });
});

// Delete Product
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(`No Product Found With This ID: ${id}`, 404);
  }

  if (product.image) {
  await deleteImage(product.image);
}

  await product.deleteOne();
  res
    .status(200)
    .json({ status: "success", message: "Product deleted successfully" });
});

// Update Product
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const newData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(`No Product Found With This ID: ${id}`, 404);
  }

  if (newData.categoryId) {
    const category = await Category.findById(newData.categoryId);
    if (!category) {
      throw new ApiError(`No Category Found With This ID: ${newData.categoryId}`, 404);
    }
  }

  if (req.file) {
   if (product.image) {
  await deleteImage(product.image);
}

    newData.image = req.file.path;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: updatedProduct });
});
