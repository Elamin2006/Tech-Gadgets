import type { RequestHandler } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Cart, { type ICart, type ICartCoupon } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";

interface AddToCartBody {
  productId: string;
  quantity: number;
}

interface UpdateCartItemBody {
  productId: string;
  quantity: number;
}

interface ApplyCouponBody {
  code: string;
}

const coupons: Record<string, ICartCoupon> = {
  SAVE10: {
    code: "SAVE10",
    discountType: "percentage",
    discountValue: 10,
  },

  SAVE20: {
    code: "SAVE20",
    discountType: "percentage",
    discountValue: 20,
  },

  SAVE50: {
    code: "SAVE50",
    discountType: "percentage",
    discountValue: 50,
  },

  SAVE80: {
    code: "SAVE80",
    discountType: "percentage",
    discountValue: 80,
  },

  OFF50: {
    code: "OFF50",
    discountType: "fixed",
    discountValue: 50,
  },
};

const emptyCartSummary = () => ({
  itemCount: 0,
  subtotal: 0,
  discountAmount: 0,
  total: 0,
  coupon: null,
  items: [],
});

const getCartSummary = (cart: ICart | null | undefined) => {
  if (!cart) {
    return emptyCartSummary();
  }

  return {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    total: cart.total,
    coupon: cart.coupon?.code ?? null,
    items: cart.cartItems,
  };
};

const restoreStock = async (
  productId: mongoose.Types.ObjectId,
  quantity: number,
  session: mongoose.ClientSession,
): Promise<void> => {
  await Product.updateOne(
    { _id: productId },
    {
      $inc: {
        stock: quantity,
      },
    },
    { session },
  );
};


 // Add product to cart.

export const addToCart: RequestHandler = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body as AddToCartBody;

  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const product = await Product.findById(productId).session(session);

    if (!product) {
      throw new ApiError(`No product found with this ID: ${productId}`, 404);
    }

    if (!product.isActive) {
      throw new ApiError("This product is no longer available.", 400);
    }

    const finalPrice =
      product.discountPrice && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    let cart = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      if (product.stock < quantity) {
        throw new ApiError("Not enough stock available.", 400);
      }

      const stockResult = await Product.updateOne(
        {
          _id: product._id,
          stock: {
            $gte: quantity,
          },
        },
        {
          $inc: {
            stock: -quantity,
          },
        },
        { session },
      );

      if (stockResult.modifiedCount === 0) {
        throw new ApiError("Not enough stock available.", 400);
      }

      await Product.updateOne(
        {
          _id: product._id,
          stock: {
            $gte: quantity,
          },
        },
        {
          $inc: {
            stock: -quantity,
          },
        },
        { session },
      );

      cart = new Cart({
        userId,
        cartItems: [
          {
            productId: product._id,
            name: product.name,
            image: product.images[0]?.url,
            price: finalPrice,
            quantity,
          },
        ],
      });

      await cart.save({ session });
    } else {
      const existingItem = cart.cartItems.find(
        (item) => item.productId.toString() === productId,
      );

      const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;

      const stockResult = await Product.updateOne(
        {
          _id: product._id,
          stock: {
            $gte: quantity,
          },
        },
        {
          $inc: {
            stock: -quantity,
          },
        },
        { session },
      );

      if (stockResult.modifiedCount === 0) {
        throw new ApiError("Not enough stock available.", 400);
      }

      if (existingItem) {
        existingItem.quantity = requestedQuantity;

        existingItem.price = finalPrice;
        existingItem.name = product.name;
        existingItem.image = product.images[0]?.url;
      } else {
        cart.cartItems.push({
          productId: product._id,
          name: product.name,
          image: product.images[0]?.url,
          price: finalPrice,
          quantity,
        });
      }

      await cart.save({ session });
    }

    await session.commitTransaction();

    sendResponse(
      res,
      200,
      "Item added to cart successfully.",
      getCartSummary(cart),
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

 // Get current user's cart.
 
export const getLoggedUserCart: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const cart = await Cart.findOne({ userId });

    sendResponse(
      res,
      200,
      "Cart retrieved successfully.",
      getCartSummary(cart),
    );
  },
);

/**
 * Update quantity of an existing cart item.
 * Increasing quantity decreases stock.
 * Decreasing quantity increases stock.
 */
export const updateCartItemQuantity: RequestHandler = asyncHandler(
  async (req, res) => {
    const { productId, quantity: newQuantity } = req.body as UpdateCartItemBody;

    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const cart = await Cart.findOne({ userId }).session(session);

      if (!cart) {
        throw new ApiError("Cart not found.", 404);
      }

      const item = cart.cartItems.find(
        (cartItem) => cartItem.productId.toString() === productId,
      );

      if (!item) {
        throw new ApiError("Item not found in cart.", 404);
      }

      const oldQuantity = item.quantity;
      const difference = newQuantity - oldQuantity;

      const product = await Product.findById(productId).session(session);

      if (!product) {
        throw new ApiError("Product not found.", 404);
      }

      if (difference > 0) {
        const stockResult = await Product.updateOne(
          {
            _id: product._id,
            stock: {
              $gte: difference,
            },
          },
          {
            $inc: {
              stock: -difference,
            },
          },
          { session },
        );

        if (stockResult.modifiedCount === 0) {
          throw new ApiError("Not enough stock available.", 400);
        }
      }

      if (difference < 0) {
        await restoreStock(product._id, Math.abs(difference), session);
      }

      item.quantity = newQuantity;

      const finalPrice =
        product.discountPrice && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      item.price = finalPrice;
      item.name = product.name;
      item.image = product.images[0]?.url;

      await cart.save({ session });

      await session.commitTransaction();

      sendResponse(
        res,
        200,
        "Cart item quantity updated successfully.",
        getCartSummary(cart),
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },
);


 // Remove product from cart.
 
export const removeFromCart: RequestHandler = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      throw new ApiError("Cart not found.", 404);
    }

    const item = cart.cartItems.find(
      (cartItem) => cartItem.productId.toString() === productId,
    );

    if (!item) {
      throw new ApiError("Item not found in cart.", 404);
    }

    const product = await Product.findById(productId).session(session);

    if (!product) {
      throw new ApiError("Product not found.", 404);
    }

    await restoreStock(product._id, item.quantity, session);

    cart.cartItems = cart.cartItems.filter(
      (cartItem) => cartItem.productId.toString() !== productId,
    );

    if (cart.cartItems.length === 0) {
      cart.coupon = null;
    }

    await cart.save({ session });

    await session.commitTransaction();

    sendResponse(
      res,
      200,
      "Item removed from cart successfully.",
      getCartSummary(cart),
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});


 // Clear user's cart and release reserved stock.
 
export const clearCart: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      throw new ApiError("Cart not found.", 404);
    }

    for (const item of cart.cartItems) {
      await restoreStock(item.productId, item.quantity, session);
    }

    cart.cartItems = [];
    cart.coupon = null;

    await cart.save({ session });

    await session.commitTransaction();

    sendResponse(res, 200, "Cart cleared successfully.", {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      coupon: null,
      items: [],
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * Apply coupon to cart.
 */
export const applyCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const { code } = req.body as ApplyCouponBody;

  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError("Cart not found.", 404);
  }

  if (cart.cartItems.length === 0) {
    throw new ApiError("Cannot apply coupon to an empty cart.", 400);
  }

  const normalizedCode = code.trim().toUpperCase();

  const coupon = coupons[normalizedCode];

  if (!coupon) {
    throw new ApiError("Invalid or expired coupon code.", 400);
  }

  cart.coupon = coupon;

  await cart.save();

  sendResponse(
    res,
    200,
    `Coupon applied successfully. ${
      coupon.discountType === "percentage"
        ? `You save ${coupon.discountValue}%.`
        : `You save $${coupon.discountValue}.`
    }`,
    getCartSummary(cart),
  );
});


 // Remove applied coupon.
 
export const removeCoupon: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError("Cart not found.", 404);
  }

  cart.coupon = null;

  await cart.save();

  sendResponse(res, 200, "Coupon removed successfully.", getCartSummary(cart));
});
