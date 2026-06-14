import Category from "../Model/Category.model.js";
import Product from "../Model/Product.model.js"; 
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "express-async-handler";
import fs from 'fs';

// 1. Create Product
export const createProduct = asyncHandler(async (req, res, next) => {
    const product = req.body;

    const category = await Category.findOne({ name: product.category?.toLowerCase() });
    if (!category) {
        throw new ApiError(`No Category Name Matches: ${product.category}`, 404);
    }

    const productData = { 
        userId: req.user?._id,
        categoryId: category._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount || 0,
        quantity: product.quantity || 1,
        image: req.file ? `/api/images/${req.file.filename}` : undefined 
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
    
    if (products.length === 0) {
        throw new ApiError("No products found", 404);
    }

    res.status(200).json({ status: "success", results: products.length, data: products });
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
        const imageName = product.image.split('/').pop();
        const imagePath = `./uploads/${imageName}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await product.deleteOne(); 
    res.status(200).json({ status: 'success', message: "Product deleted successfully" });
});

// Update Product
export const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const newData = req.body;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(`No Product Found With This ID: ${id}`, 404);
    }

    if (req.file) {
        if (product.image) {
            const oldImageName = product.image.split('/').pop(); 
            const deleteOldImage = `./uploads/${oldImageName}`;
            
            if (fs.existsSync(deleteOldImage)) {
                fs.unlinkSync(deleteOldImage);
            }
        }

        newData.image = `/api/images/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, newData, { new: true, runValidators: true });

    res.status(200).json({ status: "success", data: updatedProduct });
});