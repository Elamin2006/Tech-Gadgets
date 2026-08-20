import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Order, {
  type OrderStatus,
} from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { sendOrderEmail } from "../services/email.js";
import expressAsyncHandler from "express-async-handler";

interface CreateCashOrderBody {
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
  };
}

interface UpdateOrderStatusBody {
  status?: OrderStatus;
  isPaid?: boolean;
  isDelivered?: boolean;
}

// Create Cash Order
export const createCashOrder: RequestHandler = asyncHandler(async (req ,res ,next) => {
  
    const userId = req.user?.id;
    const { shippingAddress } = req.body as CreateCashOrderBody;

    if (!userId) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.cartItems.length === 0) {
      throw new ApiError(
        "Your cart is empty. Add products first to place an order",
        400,
      );
    }

    const orderPrice = cart.totalCartPrice ?? 0;

    const order = await Order.create({
      userId,
      orderItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice: orderPrice,
      paymentMethod: "cash",
      status: "pending",
    });

    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.productId,
        },
        update: {
          $inc: {
            quantity: -(item.quantity ?? 1),
            sold: item.quantity ?? 1,
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOption);

    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      status: "success",
      data: order,
    });

    // AuthUser doesn't contain email.
    // Get the email from the database instead.
    const user = await User.findById(userId).select("email");

    if (user?.email) {
      await sendOrderEmail(
        user.email,
        order.status ?? "pending",
        order.totalOrderPrice,
      );
    }
 
});

// Get All Orders
export const getAllOrders: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const filter =
      req.user?.role === "admin"
        ? {}
        : { userId };

    const allOrders = await Order.find(filter)
      .populate(
        "userId",
        "firstName lastName email",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: allOrders.length,
      data: allOrders,
    });
 
});

// Get Order By ID
export const getOrderById: RequestHandler = asyncHandler(async (
  req,
  res,
  next,
) => {
  
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate(
        "userId",
        "firstName lastName email",
      )
      .populate(
        "orderItems.productId",
        "name image",
      );

    if (!order) {
      throw new ApiError(
        `No order found with this ID: ${orderId}`,
        404,
      );
    }

    const orderUserId = order.userId.toString();

    const isOwner =
      orderUserId === req.user?.id;

    if (
      req.user?.role !== "admin" &&
      !isOwner
    ) {
      throw new ApiError(
        "You are not allowed to access this order",
        403,
      );
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
 
});

// Delete Order By ID
export const deleteOrderById: RequestHandler =
  asyncHandler(async (req, res, next) => {
    
      const { orderId } = req.params;

      const order =
        await Order.findByIdAndDelete(orderId);

      if (!order) {
        throw new ApiError(
          `No order found with this ID: ${orderId}`,
          404,
        );
      }

      res.status(200).json({
        status: "success",
        message: "Order deleted successfully",
        deletedOrder: order,
      });
    
  });

// Update Order Status
export const updateOrderStatus: RequestHandler =
  asyncHandler(async (req, res, next) => {
    
      const { orderId } = req.params;

      const {
        status,
        isPaid,
        isDelivered,
      } =
        req.body as UpdateOrderStatusBody;

      const order =
        await Order.findById(orderId);

      if (!order) {
        throw new ApiError(
          `No order found with this ID: ${orderId}`,
          404,
        );
      }

      if (status) {
        order.status = status;
      }

      if (isPaid !== undefined) {
        order.isPaid = isPaid;
        order.paidAt = isPaid
          ? new Date()
          : undefined;
      }

      if (isDelivered !== undefined) {
        order.isDelivered = isDelivered;
        order.deliveredAt = isDelivered
          ? new Date()
          : undefined;
      }

      const updatedOrder = await order.save();

      const populatedOrder =
        await Order.findById(orderId)
          .populate(
            "userId",
            "firstName lastName email",
          )
          .populate(
            "orderItems.productId",
            "name image",
          );

      res.status(200).json({
        status: "success",
        data: populatedOrder,
      });

      const orderUser =
        await Order.findById(orderId).populate(
          "userId",
          "email",
        );

      const populatedUser =
        orderUser?.userId as
          | { email?: string }
          | null
          | undefined;

      if (populatedUser?.email) {
        await sendOrderEmail(
          populatedUser.email,
          updatedOrder.status ?? "pending",
          updatedOrder.totalOrderPrice,
        );
      }
    
  });