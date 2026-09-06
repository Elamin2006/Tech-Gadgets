import type { RequestHandler } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/apiError.js";
import sendResponse from "../../utils/sendRes.js";

import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

import {
  getDailyRevenuePipeline,
  getOrdersByPaymentStatusPipeline,
  getOrdersByStatusPipeline,
  getRevenueStatsPipeline,
  getTopProductsPipeline,
} from "../../utils/helpers.js";

type SalesTimeframe = "monthly" | "yearly";

interface SalesQuery {
  timeframe?: string;
}

/**
 * @description Get complete admin dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin only)
 */
export const getDashboardStats: RequestHandler =
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const startOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    /*
     * Start of the last seven calendar days,
     * including today.
     */
    const sevenDaysAgo = new Date(now);

    sevenDaysAgo.setHours(
      0,
      0,
      0,
      0,
    );

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6,
    );

    
    const [
      totalUsers,
      totalCustomers,
      totalProducts,
      totalOrders,
      ordersByStatus,
      ordersByPaymentStatus,
      revenueStats,
      recentOrders,
      topProducts,
      dailyRevenue,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "customer",
      }),

      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate(
        getOrdersByStatusPipeline(),
      ),
      Order.aggregate(
        getOrdersByPaymentStatusPipeline(),
      ),
      Order.aggregate(
        getRevenueStatsPipeline(
          startOfThisMonth,
          startOfLastMonth,
          endOfLastMonth,
        ),
      ),
      Order.find()
        .select(
          [
            "userId",
            "orderItems",
            "subtotal",
            "shippingFee",
            "tax",
            "discount",
            "totalOrderPrice",
            "paymentMethod",
            "paymentStatus",
            "status",
            "isPaid",
            "paidAt",
            "isDelivered",
            "deliveredAt",
            "createdAt",
          ].join(" "),
        )
        .populate(
          "userId",
          "username email avatar",
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Order.aggregate(
        getTopProductsPipeline(),
      ),

      Order.aggregate(
        getDailyRevenuePipeline(
          sevenDaysAgo,
        ),
      ),
    ]);

    const orderStats = {
      total: totalOrders,
      pending: 0,
      completed: 0,
      canceled: 0,
    };

    for (const item of ordersByStatus) {
      if (
        typeof item._id !== "string"
      ) {
        continue;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          orderStats,
          item._id,
        )
      ) {
        orderStats[
          item._id as
            | "pending"
            | "completed"
            | "canceled"
        ] = item.count;
      }
    }

    const paymentStats = {
      total: totalOrders,
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };

    for (
      const item of ordersByPaymentStatus
    ) {
      if (
        typeof item._id !== "string"
      ) {
        continue;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          paymentStats,
          item._id,
        )
      ) {
        paymentStats[
          item._id as
            | "pending"
            | "paid"
            | "failed"
            | "refunded"
        ] = item.count;
      }
    }

    
    const {
      totalRevenue = 0,
      thisMonthRevenue = 0,
      lastMonthRevenue = 0,
    } = revenueStats[0] ?? {};

    let growthPercent = 0;

    if (lastMonthRevenue > 0) {
      growthPercent =
        (
          (
            thisMonthRevenue -
            lastMonthRevenue
          ) /
          lastMonthRevenue
        ) *
        100;
    } else if (
      thisMonthRevenue > 0
    ) {
      growthPercent = 100;
    }

    const averageOrderValue =
      paymentStats.paid > 0
        ? totalRevenue /
          paymentStats.paid
        : 0;

    return sendResponse(
      res,
      200,
      "Dashboard statistics retrieved successfully",
      {
        dashboard: {
        
          users: {
            total: totalUsers,
            customers: totalCustomers,
          },

          products: {
            total: totalProducts,
          },

          orders: orderStats,

          payments: paymentStats,

          revenue: {
            total: totalRevenue,

            thisMonth:
              thisMonthRevenue,

            lastMonth:
              lastMonthRevenue,

            growthPercent:
              Number(
                growthPercent.toFixed(
                  2,
                ),
              ),

            averageOrderValue:
              Number(
                averageOrderValue.toFixed(
                  2,
                ),
              ),
          },

          recentOrders,

          topProducts,

          ordersByStatus,

          ordersByPaymentStatus,

          dailyRevenue,
        },
      },
    );
  });

/**
 * @description Get admin sales performance
 * @route GET /api/admin/dashboard/sales
 * @access Private (Admin only)
 */
export const getSalesPerformance: RequestHandler =
  asyncHandler(async (req, res) => {
    const timeframe =
      typeof req.query.timeframe ===
      "string"
        ? req.query.timeframe
        : "monthly";

    if (
      timeframe !== "monthly" &&
      timeframe !== "yearly"
    ) {
      throw new ApiError(
        "Timeframe must be either monthly or yearly",
        400,
      );
    }

    const typedTimeframe =
      timeframe as SalesTimeframe;

    const now = new Date();

    const startDate =
      typedTimeframe ===
      "yearly"
        ? new Date(
            now.getFullYear() - 11,
            0,
            1,
          )
        : new Date(
            now.getFullYear(),
            now.getMonth() - 5,
            1,
          );

    const sales =
      await Order.aggregate([
       
        {
          $match: {
            paymentStatus: "paid",

            status: {
              $ne: "canceled",
            },

            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id:
              typedTimeframe ===
              "yearly"
                ? {
                    year: {
                      $year:
                        "$createdAt",
                    },
                  }
                : {
                    year: {
                      $year:
                        "$createdAt",
                    },

                    month: {
                      $month:
                        "$createdAt",
                    },
                  },

            revenue: {
              $sum:
                "$totalOrderPrice",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort:
            typedTimeframe ===
            "yearly"
              ? {
                  "_id.year": 1,
                }
              : {
                  "_id.year": 1,
                  "_id.month": 1,
                },
        },
      ]);

    return sendResponse(
      res,
      200,
      "Sales performance retrieved successfully",
      {
        timeframe: typedTimeframe,
        data: sales,
      },
    );
  });

/**
 * @description Get recent dashboard activity
 * @route GET /api/admin/dashboard/activity
 * @access Private (Admin only)
 */
export const getRecentActivityLog: RequestHandler =
  asyncHandler(async (_req, res) => {
    const [
      recentOrders,
      recentUsers,
    ] = await Promise.all([
    
      Order.find()
        .select(
          [
            "userId",
            "orderItems",
            "subtotal",
            "shippingFee",
            "tax",
            "discount",
            "totalOrderPrice",
            "paymentMethod",
            "paymentStatus",
            "status",
            "isPaid",
            "paidAt",
            "isDelivered",
            "deliveredAt",
            "createdAt",
          ].join(" "),
        )
        .populate(
          "userId",
          "username email avatar",
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      User.find()
        .select(
          "username email avatar role isVerified isBanned createdAt",
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    return sendResponse(
      res,
      200,
      "Recent dashboard activity retrieved successfully",
      {
        data: {
          recentOrders,
          recentUsers,
        },
      },
    );
  });