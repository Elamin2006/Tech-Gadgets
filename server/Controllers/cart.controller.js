import Product from "../Model/Product.model.js";
import Cart from "../Model/cart.model.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "express-async-handler";

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item) => {
        totalPrice += item.quantity * item.price;
    });
    cart.totalPrice = totalPrice;
    cart.totalPriceAfterDiscount = undefined;
    return totalPrice;
}

// Add Product To Cart
export const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.user?._id;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(`No Product Found With This ID: ${productId}`, 404);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({
            userId,
            cartItems: [{ productId, quantity, price: product.price }]
        });
    }else {
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.cartItems[itemIndex].quantity += quantity;
        } else {
            cart.cartItems.push({ productId, quantity, price: product.price });
        }
    }

    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
        status: "Success",
        message: "Product added to cart successfully",
        numOfCartItems: cart.cartItems.length,
        data: cart
    });
});

// Get Logged User Cart
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
    
    const cart = await Cart.findOne({ userId }).populate("cartItems.productId", "name price");
        if (!cart) {
        throw new ApiError("No Cart Found For This User", 404);
    }

    res.status(200).json({
        status: "Success",
        numOfCartItems: cart.cartItems.length,
        data: cart
    });
});

// Remove Product From Cart
export const removeFromCart = asyncHandler(async (req, res, next) => {
    const {itemId} = req.params;

    const cart = await Cart.findOneandUpdate(
        { userId: req.user?._id },
        { $pull: { cartItems: { _id: itemId } } },
        { new: true }
    );
    if (!cart) {
        throw new ApiError("No Cart Found For This User", 404);
    }
    res.status(200).json({
        status: "Success",
        numOfCartItems: cart.cartItems.length,
        data: cart
    });
});

// Clear User Cart
export const clearCart = asyncHandler(async (req, res, next) => {
   
    const cart = await Cart.findOneAndUpdate({ userId: req.user?._id });

    if (!cart) {
        throw new ApiError("No Cart found to Clear", 404);
    }
    res.status(200).json({
        status: "Success",
        message: "Cart cleared completely"
    });
});
