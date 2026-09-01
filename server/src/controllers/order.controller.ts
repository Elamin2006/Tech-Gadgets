import mongoose, {
  type ClientSession,
  type HydratedDocument,
} from "mongoose";

import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendRes.js";
import sendMail from "../utils/sendMail.js";
import ApiError from "../utils/apiError.js";
import { getPagination } from "../utils/helpers.js";

import {
  buildOrderConfirmationMailOptions,
  buildOrderStatusMailOptions,
} from "../services/emails.js";

import Order, {
  type IOrder,
  type OrderStatus,
} from "../models/order.model.js";

import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

interface CreateOrderBody {
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
  };

  paymentMethod?: "cash" | "card";

  customerNote?: string;
}

interface UpdateOrderStatusBody {
  status?: OrderStatus;
  isPaid?: boolean;
  isDelivered?: boolean;
  adminNote?: string;
}

interface MyOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

interface AllOrdersQuery
  extends MyOrdersQuery {
  paymentStatus?:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

  from?: Date;
  to?: Date;

  sortBy?:
    | "createdAt"
    | "totalOrderPrice"
    | "status"
    | "paymentStatus";

  sortDir?: "asc" | "desc";
}

const getOrderId = (
  req: Parameters<RequestHandler>[0],
): string => {
  const { orderId } = req.params;

  if (
    typeof orderId !== "string"
  ) {
    throw new ApiError(
      "Invalid order ID",
      400,
    );
  }

  return orderId;
};

const getUserId = (
  req: Parameters<RequestHandler>[0],
): string => {
  if (!req.user?.id) {
    throw new ApiError(
      "Unauthorized access",
      401,
    );
  }

  return req.user.id;
};

const assertValidObjectId = (
  id: string,
): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      "Invalid order ID",
      400,
    );
  }
};

const roundMoney = (
  value: number,
): number =>
  Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;

/**
 * Creates the order and updates stock/cart
 * inside one MongoDB transaction.
 */
const createOrderInTransaction = async (
  req: Parameters<RequestHandler>[0],
  session: ClientSession,
): Promise<{
  order: HydratedDocument<IOrder>;
  cartUserEmail?: string;
  username: string;
}> => {
  const userId = getUserId(req);

  const {
    shippingAddress,
    paymentMethod = "cash",
    customerNote = "",
  } =
    req.body as CreateOrderBody;

  const cart = await Cart.findOne({
    userId,
  }).session(session);

  if (
    !cart ||
    cart.cartItems.length === 0
  ) {
    throw new ApiError(
      "Your cart is empty. Add products first to place an order",
      400,
    );
  }

 
  const orderItems = cart.cartItems.map(
    (item) => ({
      productId: item.productId,
      name: "",
      image: "",
      quantity: item.quantity,
      price: roundMoney(item.price),
    }),
  );

  const productIds =
    cart.cartItems.map(
      (item) => item.productId,
    );

  const products = await Product.find({
    _id: {
      $in: productIds,
    },

    isActive: true,
  })
    .select(
      "name images stock",
    )
    .session(session);

  const productMap = new Map(
    products.map(
      (product) => [
        product._id.toString(),
        product,
      ],
    ),
  );

  for (const item of orderItems) {
    const product =
      productMap.get(
        item.productId.toString(),
      );

    if (!product) {
      throw new ApiError(
        "One or more products are no longer available",
        400,
      );
    }

    const image =
      product.images[0]?.url;

    if (!image) {
      throw new ApiError(
        `Product ${product.name} has no image`,
        400,
      );
    }

    item.name = product.name;
    item.image = image;
  }

  const subtotal =
    roundMoney(cart.subtotal);

  const discount =
    roundMoney(
      cart.couponDiscount,
    );

  const shippingFee =
    subtotal >= 1000
      ? 0
      : 50;

  const tax =
    roundMoney(
      subtotal * 0.14,
    );

  const totalOrderPrice =
    roundMoney(
      Math.max(
        0,
        subtotal +
          shippingFee +
          tax -
          discount,
      ),
    );

  const [order] =
    await Order.create(
      [
        {
          userId:
            new mongoose.Types.ObjectId(
              userId,
            ),

          orderItems,
          shippingAddress,
          paymentMethod,
          paymentStatus:
            "pending",
          subtotal,
          shippingFee,
          tax,
          discount,
          totalOrderPrice,
          status:
            "pending",
          isPaid: false,
          isDelivered: false,
          customerNote,
        },
      ],
      {
        session,
      },
    );

  if (!order) {
    throw new ApiError(
      "Failed to create order",
      500,
    );
  }


  for (const item of cart.cartItems) {
    const product =
      await Product.findOneAndUpdate(
        {
          _id: item.productId,

          isActive: true,

          stock: {
            $gte: item.quantity,
          },
        },

        {
          $inc: {
            stock: -item.quantity,
          },
        },

        {
          new: true,
          session,
        },
      );

    if (!product) {
      throw new ApiError(
        `Insufficient stock for product ${item.productId}`,
        400,
      );
    }
  }


  cart.cartItems = [];

  cart.couponId =
    undefined;

  cart.couponCode =
    undefined;

  cart.couponDiscount = 0;

  cart.subtotal = 0;

  cart.totalCartPrice = 0;

  await cart.save({
    session,
  });

  const user =
    await User.findById(
      userId,
    )
      .select(
        "email username",
      )
      .session(session);

  return {
    order,

    cartUserEmail:
      user?.email,

    username:
      user?.username ??
      "Customer",
  };
};

/*
  new order from the authenticated user's cart.
 */
export const createCashOrder:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const session =
        await mongoose.startSession();

      let result:
        Awaited<
          ReturnType<
            typeof createOrderInTransaction
          >
        >;

      try {
        session.startTransaction();

        result =
          await createOrderInTransaction(
            req,
            session,
          );

        await session.commitTransaction();
      } catch (error) {
        if (
          session.inTransaction()
        ) {
          await session.abortTransaction();
        }

        throw error;
      } finally {
        await session.endSession();
      }

      if (result.cartUserEmail) {
        const mailOptions =
          buildOrderConfirmationMailOptions(
            result.cartUserEmail,
            result.username,
            result.order,
          );

        try {
          await sendMail(mailOptions);
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown email error";

          console.error(
            "Order confirmation email failed:",
            message,
          );
        }
      }

      sendResponse(
        res,
        201,
        "Order placed successfully",
        {
          data: result.order,
        },
      );
    },
  );

 // Get customer's orders.
 
export const getMyOrders:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const userId =
        getUserId(req);

      const query =
        req.query as unknown as
          MyOrdersQuery;

      const {
        currentPage,
        limitPerPage,
        skip,
      } =
        getPagination(
          query.page ?? 1,
          query.limit ?? 10,
        );

      const filter:
        Record<string, unknown> =
        {
          userId,
        };

      if (query.status) {
        filter.status =
          query.status;
      }

      const [
        total,
        orders,
      ] =
        await Promise.all([
          Order.countDocuments(
            filter,
          ),

          Order.find(filter)
            .populate(
              "orderItems.productId",
              "name images",
            )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(
              limitPerPage,
            ),
        ]);

      sendResponse(
        res,
        200,
        "Orders retrieved successfully",
        {
          data: orders,

          total,

          currentPage,

          totalPages:
            Math.ceil(
              total /
                limitPerPage,
            ),
        },
      );
    },
  );

/**
 * Get all orders for admin.
 * Customers are restricted to their own
 */
export const getAllOrders:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const userId =
        getUserId(req);

      const query =
        req.query as unknown as
          AllOrdersQuery;

      const {
        currentPage,
        limitPerPage,
        skip,
      } =
        getPagination(
          query.page ?? 1,
          query.limit ?? 10,
        );

      const filter:
        Record<string, unknown> =
        req.user?.role === "admin"
          ? {}
          : { userId };

      if (query.status) {
        filter.status =
          query.status;
      }

      if (query.paymentStatus) {
        filter.paymentStatus =
          query.paymentStatus;
      }

      if (
        query.from ||
        query.to
      ) {
        const createdAt: {
          $gte?: Date;
          $lte?: Date;
        } = {};

        if (query.from) {
          createdAt.$gte =
            query.from;
        }

        if (query.to) {
          const endDate =
            new Date(
              query.to,
            );

          endDate.setHours(
            23,
            59,
            59,
            999,
          );

          createdAt.$lte =
            endDate;
        }

        filter.createdAt =
          createdAt;
      }

      const sortField =
        query.sortBy ??
        "createdAt";

      const sortDirection =
        query.sortDir === "asc"
          ? 1
          : -1;

      const sort =
        {
          [sortField]:
            sortDirection,
        } as Record<
          string,
          1 | -1
        >;

      const [
        total,
        orders,
      ] =
        await Promise.all([
          Order.countDocuments(
            filter,
          ),

          Order.find(filter)
            .populate(
              "userId",
              "username email",
            )
            .populate(
              "orderItems.productId",
              "name images",
            )
            .sort(sort)
            .skip(skip)
            .limit(
              limitPerPage,
            ),
        ]);

      return sendResponse(
        res,
        200,
        "Orders retrieved successfully",
        {
          data: orders,

          total,

          currentPage,

          totalPages:
            Math.ceil(
              total /
                limitPerPage,
            ),
        },
      );
    },
  );

/**
 * Get one order.
 * Ownership is checked before population.
 */
export const getOrderById:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const userId =
        getUserId(req);

      const orderId =
        getOrderId(req);

      assertValidObjectId(
        orderId,
      );

      const order =
        await Order.findById(
          orderId,
        );

      if (!order) {
        throw new ApiError(
          `No order found with this ID: ${orderId}`,
          404,
        );
      }

      if (
        req.user?.role !==
          "admin" &&
        order.userId.toString() !==
          userId
      ) {
        throw new ApiError(
          "You are not allowed to access this order",
          403,
        );
      }

      const populatedOrder =
        await Order.findById(
          orderId,
        )
          .populate(
            "userId",
            "username email",
          )
          .populate(
            "orderItems.productId",
            "name images",
          );

      if (!populatedOrder) {
        throw new ApiError(
          "Order not found after retrieval",
          404,
        );
      }

      sendResponse(
        res,
        200,
        "Order retrieved successfully",
        {
          data:
            populatedOrder,
        },
      );
    },
  );


 // Admin-only order deletion.
 
export const deleteOrderById:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const orderId =
         getOrderId(req);

      assertValidObjectId(
        orderId,
      );

      const order =
        await Order.findByIdAndDelete(
          orderId,
        );

      if (!order) {
        throw new ApiError(
          `No order found with this ID: ${orderId}`,
          404,
        );
      }

      sendResponse(
        res,
        200,
        "Order deleted successfully",
        {
          data: order,
        },
      );
    },
  );


 // Admin-only order update.

export const updateOrderStatus:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const orderId =
         getOrderId(req);

      const {
        status,
        isPaid,
        isDelivered,
        adminNote,
      } =
        req.body as
          UpdateOrderStatusBody;

      assertValidObjectId(
        orderId,
      );

      const order =
        await Order.findById(
          orderId,
        );

      if (!order) {
        throw new ApiError(
          `No order found with this ID: ${orderId}`,
          404,
        );
      }

      const previousStatus =
        order.status;

      if (
        status !==
        undefined
      ) {
        order.status =
          status;

        if (
          status ===
          "completed"
        ) {
          order.isDelivered =
            true;

          order.deliveredAt =
            new Date();
        }

        if (
          status ===
          "canceled"
        ) {
          order.cancelledAt =
            new Date();
        }
      }

      if (
        isPaid !==
        undefined
      ) {
        order.isPaid =
          isPaid;

        order.paymentStatus =
          isPaid
            ? "paid"
            : "pending";

        order.paidAt =
          isPaid
            ? new Date()
            : undefined;
      }

      if (
        isDelivered !==
        undefined
      ) {
        order.isDelivered =
          isDelivered;

        order.deliveredAt =
          isDelivered
            ? new Date()
            : undefined;
      }

      if (
        adminNote !==
        undefined
      ) {
        order.adminNote =
          adminNote;
      }

      await order.save();

      const populatedOrder =
        await Order.findById(
          orderId,
        )
          .populate(
            "userId",
            "username email",
          )
          .populate(
            "orderItems.productId",
            "name images",
          );

      if (!populatedOrder) {
        throw new ApiError(
          "Order not found after update",
          404,
        );
      }

     const user =
  await User.findById(
    order.userId,
  ).select(
    "email username",
  );

if (
  status &&
  previousStatus !== status &&
  user?.email
) {
  const mailOptions =
    buildOrderStatusMailOptions(
      user.email,
      user.username,
      order._id.toString(),
      order.status,
      order.totalOrderPrice,
      order.adminNote,
    );

  try {
    await sendMail(mailOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown email error";

    console.error(
      "Order status email failed:",
      message,
    );
  }
}

      sendResponse(
        res,
        200,
        "Order updated successfully",
        {
          data:
            populatedOrder,
        },
      );
    },
  );

/**
 * Customer cancellation.
 * Only pending orders can be cancelled.
 * Product stock is restored atomically.
 */
export const cancelMyOrder:
  RequestHandler =
  asyncHandler(
    async (req, res) => {
      const userId =
        getUserId(req);

     const orderId =
       getOrderId(req);
      assertValidObjectId(
        orderId,
      );

      const session =
        await mongoose.startSession();

      let cancelledOrder:
        HydratedDocument<IOrder>;

      try {
        session.startTransaction();

        const order =
          await Order.findOne({
            _id: orderId,

            userId,

            status: {
              $in: ["pending"],
            },
          }).session(
            session,
          );

        if (!order) {
          throw new ApiError(
            "Order not found or cannot be canceled in its current status",
            400,
          );
        }

        for (
          const item of
            order.orderItems
        ) {
          const product =
            await Product.findByIdAndUpdate(
              item.productId,

              {
                $inc: {
                  stock:
                    item.quantity,
                },
              },

              {
                new: true,
                session,
              },
            );

          if (!product) {
            throw new ApiError(
              `Product not found: ${item.productId}`,
              404,
            );
          }
        }

        order.status =
          "canceled";

        order.cancelledAt =
          new Date();

        await order.save({
          session,
        });

        cancelledOrder =
          order;

        await session.commitTransaction();
      } catch (error) {
        if (
          session.inTransaction()
        ) {
          await session.abortTransaction();
        }

        throw error;
      } finally {
        await session.endSession();
      }

      const user =
  await User.findById(
    userId,
  ).select(
    "email username",
  );

if (user?.email) {
  const mailOptions =
    buildOrderStatusMailOptions(
      user.email,
      user.username,
      cancelledOrder._id.toString(),
      "canceled",
      cancelledOrder.totalOrderPrice,
    );

  try {
    await sendMail(mailOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown email error";

    console.error(
      "Order cancellation email failed:",
      message,
    );
  }
}

      sendResponse(
        res,
        200,
        "Order canceled successfully",
        {
          data:
            cancelledOrder,
        },
      );
    },
  );

export const getMyOrderById =
  getOrderById;

export const getAdminOrderById =
  getOrderById;