import type { RequestHandler } from "express";
import asyncHandler from "express-async-handler";

import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

export const getDashboardStats: RequestHandler = asyncHandler(async (_req, res, next) => {
    
      const totalUsers =
        await User.countDocuments();

      const totalProducts =
        await Product.countDocuments();

      const totalOrders =
        await Order.countDocuments();

      const totalRevenue =
        await Order.aggregate([
          {
            $group: {
              _id: null,
              revenue: {
                $sum: "$totalOrderPrice",
              },
            },
          },
        ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue:
            totalRevenue[0]?.revenue ?? 0,
        },
      });
   
  });

export const getSalesPerformance: RequestHandler = asyncHandler(async (req, res, next) => {
   
      const timeframe =
        typeof req.query.timeframe === "string"
          ? req.query.timeframe
          : "monthly";

      const sales =
        await Order.aggregate([
          {
            $group: {
              _id: {
                year: {
                  $year: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
              },
              revenue: {
                $sum: "$totalOrderPrice",
              },
              orders: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
            },
          },
          {
            $limit:
              timeframe === "yearly"
                ? 12
                : 6,
          },
        ]);

      res.status(200).json({
        success: true,
        data: sales,
      });
    
  });

export const getRecentActivityLog: RequestHandler = asyncHandler(async (_req, res, next) => {
    
      const recentOrders =
        await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

      const recentUsers =
        await User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

      res.status(200).json({
        success: true,
        data: {
          recentOrders,
          recentUsers,
        },
      });
    
  });