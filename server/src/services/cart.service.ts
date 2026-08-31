import mongoose from "mongoose";

import Cart from "../models/cart.model.js";
import Coupon, { type ICoupon } from "../models/coupon.model.js";
import Product, { type IProduct } from "../models/product.model.js";
import ApiError from "../utils/apiError.js";

export interface CartPricingItem {
  quantity: number;
  price: number;
  product: Pick<IProduct, "price" | "discountPercentage">;
}

export interface CartPricingResult {
  subtotal: number;
  eligibleSubtotal: number;
  couponDiscount: number;
  total: number;
}

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Calculates the selling price from the product base price and percentage promotion. */
export const calculateProductSalePrice = (
  product: Pick<IProduct, "price" | "discountPercentage">,
): number => {
  const discount = Math.min(Math.max(product.discountPercentage, 0), 100);
  return roundMoney(product.price - (product.price * discount) / 100);
};

/** Calculates the additional cart-level coupon discount after product promotions. */
export const calculateCartPricing = (
  items: CartPricingItem[],
  coupon?: ICoupon | null,
): CartPricingResult => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  if (!coupon) {
    return { subtotal, eligibleSubtotal: 0, couponDiscount: 0, total: subtotal };
  }

  const eligibleSubtotal = roundMoney(
    items.reduce((sum, item) => {
      const isDiscounted = item.product.discountPercentage > 0;
      const eligible = coupon.appliesToDiscountedProducts || !isDiscounted;
      return eligible ? sum + item.price * item.quantity : sum;
    }, 0),
  );

  if (eligibleSubtotal < coupon.minimumOrderAmount) {
    return { subtotal, eligibleSubtotal, couponDiscount: 0, total: subtotal };
  }

  let couponDiscount =
    coupon.type === "percentage"
      ? (eligibleSubtotal * coupon.value) / 100
      : coupon.value;

  if (coupon.maximumDiscount !== undefined) {
    couponDiscount = Math.min(couponDiscount, coupon.maximumDiscount);
  }

  couponDiscount = roundMoney(
    Math.min(Math.max(couponDiscount, 0), eligibleSubtotal),
  );

  return {
    subtotal,
    eligibleSubtotal,
    couponDiscount,
    total: roundMoney(subtotal - couponDiscount),
  };
};

export const getValidCoupon = async (
  couponId?: mongoose.Types.ObjectId,
): Promise<ICoupon | null> => {
  if (!couponId) return null;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new ApiError("Coupon is no longer available", 400);
  if (!coupon.isActive) throw new ApiError("This coupon is inactive", 400);
  if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
    throw new ApiError("This coupon has expired", 400);
  }
  if (
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new ApiError("This coupon has reached its usage limit", 400);
  }

  return coupon;
};

/** Synchronizes server-owned prices, stock, coupon eligibility and totals. */
export const synchronizeCart = async (
  cart: InstanceType<typeof Cart>,
): Promise<void> => {
  const productIds = cart.cartItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "name price discountPercentage stock isActive",
  );
  const productMap = new Map(products.map((product) => [product.id, product]));

  cart.cartItems = cart.cartItems.filter((item) =>
    productMap.has(item.productId.toString()),
  );

  for (const item of cart.cartItems) {
    const product = productMap.get(item.productId.toString());
    if (!product) continue;
    if (!product.isActive) {
      throw new ApiError(`${product.name} is no longer available`, 400);
    }
    if (item.quantity > product.stock) {
      throw new ApiError(`${product.name} only has ${product.stock} item(s) available`, 400);
    }
    item.price = calculateProductSalePrice(product);
  }

  const coupon = await getValidCoupon(cart.couponId);
  const pricing = calculateCartPricing(
    cart.cartItems.map((item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) throw new ApiError("Cart contains an invalid product", 400);
      return { quantity: item.quantity, price: item.price, product };
    }),
    coupon,
  );

  if (coupon && pricing.eligibleSubtotal >= coupon.minimumOrderAmount) {
    cart.couponDiscount = pricing.couponDiscount;
  } else {
    // Remove the coupon automatically if cart changes make it ineligible.
    cart.couponId = undefined;
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
  }

  cart.subtotal = pricing.subtotal;
  cart.totalCartPrice = roundMoney(cart.subtotal - cart.couponDiscount);
};
