import Category from "../Model/Category.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../Utils/apiError.js";

// Create Category
export const createCategory = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    const categoryData = {
        userId: req.user?._id,
        name: name
    };

    const categoryExists = await Category.findOne({ name: categoryData.name });
    if (categoryExists) {
        throw new ApiError(`Category with name "${name}" already exists`, 400);
    }

    const newCategory = new Category(categoryData);
    await newCategory.save(); 

    res.status(201).json({
        status: "success",
        data: newCategory
    });
});

// Get All Categories
export const getCategories = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find();
    
    if (allCategories.length === 0) {
        throw new ApiError("No categories inserted yet", 404);
    }

    res.status(200).json({
        status: "success",
        results: allCategories.length,
        data: allCategories
    });
});

// Get Category By ID
export const getCategoryById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(`No category found with this ID: ${id}`, 404);
    }

    res.status(200).json({
        status: "success",
        data: category
    });
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new ApiError(`No category found with this ID: ${id}`, 404);
    }

    res.status(200).json({
        status: 'success',
        message: "Category deleted successfully",
        deletedCategory: category 
    });
});