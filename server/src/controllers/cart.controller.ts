import type { RequestHandler } from "express";
import mongoose from "mongoose";

import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "express-async-handler";

interface AddToCartBody {
  productId: string;
  quantity: number;
}

interface UpdateCartItemBody {
  quantity: number;
}

const calculateProductPriceAfterDiscount = (product: {
    price: number;
    discount?: number;
  }) => {
  let finalPrice = product.price;
  if (product.discount && product.discount > 0) {
    finalPrice = product.price - (product.price * product.discount) / 100;
  }
  return finalPrice;
};

const calcTotalCartPrice = (cart: {
  cartItems: Array<{
    quantity: number;
    price: number;
  }>;
  totalCartPrice: number;
}) : number => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  return totalPrice;
};

// Add Product To Cart
export const addToCart : RequestHandler = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body as AddToCartBody;
  const userId = req.user?.id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(`No Product Found With This ID: ${productId}`, 404);
  }

  const finalProductPrice = calculateProductPriceAfterDiscount(product);

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      cartItems: [{ productId: new mongoose.Types.ObjectId(productId), quantity, price: finalProductPrice }],
    });
  } else {
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
      cart.cartItems[itemIndex].price = finalProductPrice;
    } else {
      const productObjectId = new mongoose.Types.ObjectId(productId);

      cart.cartItems.push({ productId: productObjectId, quantity, price: finalProductPrice });
    }
  }

  calcTotalCartPrice(cart);
  await cart.save();

  const refreshedCart = await Cart.findOne({ userId }).populate(
    "cartItems.productId",
    "name price image",
  );
  if (!refreshedCart) {
  throw new ApiError("Cart not found after update", 404);
}

  res.status(200).json({
    status: "Success",
    numOfCartItems: refreshedCart.cartItems.length,
    data: refreshedCart,
  });
});
// Get Logged User Cart
export const getLoggedUserCart : RequestHandler = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  const cart = await Cart.findOne({ userId }).populate(
    "cartItems.productId",
    "name price image",
  );
  if (!cart) {
    throw new ApiError("No Cart Found For This User", 404);
  }

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// Update Cart Item Quantity
export const updateCartItemQuantity : RequestHandler= asyncHandler(async (req, res, next) => {
  const { quantity } = req.body as UpdateCartItemBody;
  const { itemId } = req.params;
  const userId = req.user?.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError("No Cart Found For This User", 404);
  }

 const itemIndex = cart.cartItems.findIndex(
  (item) => item._id?.toString() === itemId,
);
  if (itemIndex === -1) {
    throw new ApiError("This item is no longer in your cart", 404);
  }

  const cartItem = cart.cartItems[itemIndex];
  const productId = cartItem.productId;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(`No Product Found With This ID: ${productId}`, 404);
  }

  const finalProductPrice = calculateProductPriceAfterDiscount(product);
  cart.cartItems[itemIndex].quantity = quantity;
  cart.cartItems[itemIndex].price = finalProductPrice;

  calcTotalCartPrice(cart);
  await cart.save();

  const refreshedCart = await Cart.findOne({ userId }).populate(
    "cartItems.productId",
    "name price image",
  );

  if (!refreshedCart) {
  throw new ApiError("Cart not found after update", 404);
}

  res.status(200).json({
    status: "Success",
    numOfCartItems: refreshedCart.cartItems.length,
    data: refreshedCart,
  });
});

// Remove Product From Cart
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user?.id;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError("No Cart Found For This User", 404);
  }

  const itemExists = cart.cartItems.some(
  (item) => item._id?.toString() === itemId,
);

  if (!itemExists) {
    throw new ApiError("This item is no longer in your cart", 404);
  }

  cart.cartItems = cart.cartItems.filter(
    (item) => item._id?.toString() !== itemId
  );

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// Clear User Cart
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user?.id },
    {
      $set: {
        cartItems: [],
        totalCartPrice: 0,
        totalPriceAfterDiscount: undefined,
      },
    },
    { new: true },
  );

  if (!cart) {
    throw new ApiError("No Cart found to Clear", 404);
  }
  res.status(200).json({
    status: "Success",
    message: "Cart cleared completely",
  });
});
