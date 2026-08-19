import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import ApiError from "../utils/apiError.js";

interface CreateCategoryBody {
  name: string;
}

export const createCategory: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const { name } =
      req.body as CreateCategoryBody;

    const categoryExists =
      await Category.findOne({ name });

    if (categoryExists) {
      throw new ApiError(
        `Category with name "${name}" already exists`,
        400,
      );
    }

    const newCategory = await Category.create({
      userId: req.user?.id,
      name,
    });

    res.status(201).json({
      status: "success",
      data: newCategory,
    });
 
});

export const getCategories: RequestHandler = asyncHandler(async (
  _req,
  res,
  next,
) => {
  
    const allCategories =
      await Category.find();

    res.status(200).json({
      status: "success",
      results: allCategories.length,
      data: allCategories,
    });
  
});

export const getCategoryById: RequestHandler =
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

      const category =
        await Category.findById(id);

      if (!category) {
        throw new ApiError(
          `No category found with this ID: ${id}`,
          404,
        );
      }

      res.status(200).json({
        status: "success",
        data: category,
      });
   
  });

export const deleteCategory: RequestHandler =
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

      const category =
        await Category.findByIdAndDelete(id);

      if (!category) {
        throw new ApiError(
          `No category found with this ID: ${id}`,
          404,
        );
      }

      res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
        deletedCategory: category,
      });
   
  });