import Product from "../Model/Product.model.js";
import Cart from "../Model/Cart.model.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "express-async-handler";


const calculateProductPriceAfterDiscount = (product) => {
    let finalPrice = product.price;
    if (product.discount && product.discount > 0) {
        finalPrice = product.price - (product.price * product.discount) / 100;
    }
    return finalPrice;
};

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item) => {
        totalPrice += item.quantity * item.price;
    });
    cart.totalCartPrice = totalPrice;
    return totalPrice;
};

// Add Product To Cart
export const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.user?._id;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(`No Product Found With This ID: ${productId}`, 404);
    }

    const finalProductPrice = calculateProductPriceAfterDiscount(product);

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
        cart = await Cart.create({
            userId,
            cartItems: [{ productId, quantity, price: finalProductPrice }]
        });
    } else {
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        
        if (itemIndex > -1) {
            cart.cartItems[itemIndex].quantity += quantity;
            cart.cartItems[itemIndex].price = finalProductPrice; 
        } else {
            cart.cartItems.push({ productId, quantity, price: finalProductPrice });
        }
    }

    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
        status: "Success",
        numOfCartItems: cart.cartItems.length,
        data: cart
    });
});
// Get Logged User Cart
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

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
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
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
    const cart = await Cart.findOneAndUpdate(
        { userId: req.user?._id },
        { $set: { cartItems: [], totalCartPrice: 0, totalPriceAfterDiscount: undefined } },
        { new: true }
    );

    if (!cart) {
        throw new ApiError("No Cart found to Clear", 404);
    }
    res.status(200).json({
        status: "Success",
        message: "Cart cleared completely"
    });
});
