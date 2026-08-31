import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendRes.js";

import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import Coupon from "../models/coupon.model.js";
import ApiError from "../utils/apiError.js";
import {
  calculateProductSalePrice,
  synchronizeCart,
  getValidCoupon,
  calculateCartPricing,
} from "../services/cart.service.js";

interface AddToCartBody {
  productId: string;
  quantity: number;
}

interface UpdateCartItemBody {
  quantity: number;
}

interface ApplyCouponBody {
  code: string;
}

const getUserId = (req: Parameters<RequestHandler>[0]): string => {
  if (!req.user?.id) {
    throw new ApiError("Unauthorized access", 401);
  }
  return req.user.id;
};

const getPopulatedCart = (userId: string) =>
  Cart.findOne({ userId }).populate(
    "cartItems.productId",
    "name price discountPercentage images stock",
  );

export const addToCart: RequestHandler = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body as AddToCartBody;
  const userId = getUserId(req);

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError("Product not found or inactive", 404);
  }

  const cart =
    (await Cart.findOne({ userId })) ??
    new Cart({ userId, cartItems: [] });

  const item = cart.cartItems.find(
    (cartItem) => cartItem.productId.toString() === productId,
  );

  const newQuantity = (item?.quantity ?? 0) + quantity;
  if (newQuantity > product.stock) {
    throw new ApiError(`Only ${product.stock} item(s) are available`, 400);
  }

  if (item) {
    item.quantity = newQuantity;
    item.price = calculateProductSalePrice(product);
  } else {
    cart.cartItems.push({
      productId: product._id,
      quantity,
      price: calculateProductSalePrice(product),
    });
  }

  await synchronizeCart(cart);
  await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after update", 404);

  sendResponse(res, 200, "Item added to cart successfully", { cart: refreshedCart });
});

export const getLoggedUserCart: RequestHandler = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });

   if (!cart) {
     
      sendResponse(res, 200, "Cart is empty", {
        cart: {
          cartItems: [],
          subtotal: 0,
          couponDiscount: 0,
          totalCartPrice: 0,
        },
        numOfCartItems: 0,
      });

      return;
    }

    await synchronizeCart(cart);
    await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after update", 404);

  sendResponse(res, 200, "Cart retrieved successfully", { 
  cart: refreshedCart, 
  numOfCartItems: refreshedCart.cartItems.length,

});
})

export const updateCartItemQuantity: RequestHandler = asyncHandler(async (req, res) => {
  const { quantity } = req.body as UpdateCartItemBody;
  const { itemId } = req.params;
  const userId = getUserId(req);

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError("No cart found for this user", 404);

  const item = cart.cartItems.find((cartItem) => cartItem._id?.toString() === itemId);
  if (!item) throw new ApiError("This item is no longer in your cart", 404);

  const product = await Product.findById(item.productId);
  if (!product || !product.isActive) throw new ApiError("Product is no longer available", 400);
  if (quantity > product.stock) throw new ApiError(`Only ${product.stock} item(s) are available`, 400);

  item.quantity = quantity;
  item.price = calculateProductSalePrice(product);

  await synchronizeCart(cart);
  await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after update", 404);

  sendResponse(res, 200, "Cart item quantity updated successfully", { 
    cart: refreshedCart,
    numOfCartItems: refreshedCart.cartItems.length,

   });
});

export const removeFromCart: RequestHandler = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError("No cart found for this user", 404);

  const before = cart.cartItems.length;
  cart.cartItems = cart.cartItems.filter(
    (item) => item._id?.toString() !== req.params.itemId,
  );

  if (cart.cartItems.length === before) {
    throw new ApiError("This item is no longer in your cart", 404);
  }

  await synchronizeCart(cart);
  await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after update", 404);

  sendResponse(res, 200, "Item removed from cart successfully", {
      cart: refreshedCart,
      numOfCartItems: refreshedCart.cartItems.length,
    });

});

export const applyCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const { code } = req.body as ApplyCouponBody;
  const userId = getUserId(req);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError("Invalid coupon code", 404);
  await getValidCoupon(coupon._id);

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.cartItems.length === 0) {
    throw new ApiError("Add products to your cart before applying a coupon", 400);
  }

  cart.couponId = coupon._id;
  cart.couponCode = coupon.code;
  await synchronizeCart(cart);

  const products = await Product.find({
    _id: { $in: cart.cartItems.map((item) => item.productId) },
  }).select("price discountPercentage");
  const productMap = new Map(products.map((product) => [product.id, product]));

  const pricing = calculateCartPricing(
    cart.cartItems.map((item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) throw new ApiError("Cart contains an invalid product", 400);
      return {
        quantity: item.quantity,
        price: item.price,
        product,
      };
    }),
    coupon,
  );

  if (pricing.eligibleSubtotal < coupon.minimumOrderAmount) {
    cart.couponId = undefined;
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    cart.totalCartPrice = cart.subtotal;
    await cart.save();
    throw new ApiError(
      `This coupon requires an eligible subtotal of at least $${coupon.minimumOrderAmount.toFixed(2)}`,
      400,
    );
  }

  cart.couponDiscount = pricing.couponDiscount;
  cart.totalCartPrice = pricing.total;
  await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after coupon update", 404);

  sendResponse(res, 200, "Coupon applied successfully", {
      cart: refreshedCart,
      numOfCartItems: refreshedCart.cartItems.length,
    });

});

export const removeCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError("No cart found for this user", 404);

  cart.couponId = undefined;
  cart.couponCode = undefined;
  cart.couponDiscount = 0;

  await synchronizeCart(cart);
  await cart.save();

  const refreshedCart = await getPopulatedCart(userId);
  if (!refreshedCart) throw new ApiError("Cart not found after coupon removal", 404);

  sendResponse(res, 200, "Coupon removed successfully", {
      cart: refreshedCart,
      numOfCartItems: refreshedCart.cartItems.length,
    });

});

export const clearCart: RequestHandler = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  await Cart.findOneAndDelete({ userId });

  sendResponse(res, 200, "Cart cleared successfully", {
      cart: {
        cartItems: [],
        subtotal: 0,
        couponDiscount: 0,
        totalCartPrice: 0,
      },
      numOfCartItems: 0,
    });
});
