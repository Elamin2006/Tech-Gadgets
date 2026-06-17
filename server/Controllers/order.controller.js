import Order from "../Model/Order.model.js";
import Cart from "../Model/Cart.model.js";
import Product from "../Model/Product.model.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "express-async-handler";
import { sendOrderEmail } from "../Services/email.js";

// Create Cash Order 
export const createCashOrder = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.cartItems.length === 0) {
        throw new ApiError("Your cart is empty. Add products first to place an order", 400);
    }

    const orderPrice =  cart.totalCartPrice;

    const order = await Order.create({
        userId,
        orderItems: cart.cartItems,
        shippingAddress,
        totalOrderPrice: orderPrice,
        paymentMethod: "cash",
        status: "pending"
    });

    const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
    }));
    await Product.bulkWrite(bulkOption, {});

    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ status: "success", data: order });

    if (req.user?.email) {
        sendOrderEmail(req.user.email, order.status, order.totalOrderPrice);
    }
});

export const getAllOrders = asyncHandler(async (req, res, next) => {
    const allOrders = await Order.find().populate("userId", "name email");
    
    if (allOrders.length === 0) {
        throw new ApiError("No orders found yet", 404);
    }

    res.status(200).json({ status: "success", results: allOrders.length, data: allOrders }); 
});

// Get Order By ID
export const getOrderById = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("orderItems.productId", "name image");
    
    if (!order) {
        throw new ApiError(`No order found with this ID: ${orderId}`, 404);
    }

    res.status(200).json({ status: "success", data: order });
});

// Delete Order By ID 
export const deleteOrderById = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
        throw new ApiError(`No order found with this ID: ${orderId}`, 404);
    }

    res.status(200).json({ status: 'success', message: "Order deleted successfully", deletedOrder: order });
});

// Update Order Status 
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, isPaid, isDelivered } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(`No order found with this ID: ${orderId}`, 404);
    }

    if (status) order.status = status;
    if (isPaid !== undefined) {
        order.isPaid = isPaid;
        order.paidAt = isPaid ? Date.now() : undefined;
    }
    if (isDelivered !== undefined) {
        order.isDelivered = isDelivered;
        order.deliveredAt = isDelivered ? Date.now() : undefined;
    }

    const updatedOrder = await order.save();
    res.status(200).json({ status: "success", data: updatedOrder });

    const orderUser = await Order.findById(orderId).populate("userId", "email");
    if (orderUser?.userId?.email) {
        sendOrderEmail(orderUser.userId.email, updatedOrder.status, updatedOrder.totalOrderPrice);
    }
});