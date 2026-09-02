
import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";

import stripe from "../config/stripe.js";

import Order from "../models/order.model.js";


const getStripeAmount = (
  totalOrderPrice: number,
): number => {
  const amount = Math.round(
    totalOrderPrice * 100,
  );

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new ApiError(
      "Invalid order amount",
      400,
    );
  }

  return amount;
};


export const createPaymentIntent: RequestHandler =
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (
      typeof orderId !== "string" ||
      !orderId
    ) {
      throw new ApiError(
        "Order ID is required",
        400,
      );
    }

    if (!req.user?.id) {
      throw new ApiError(
        "Unauthorized access",
        401,
      );
    }

    const userId = req.user.id;

    const order =
      await Order.findOne({
        _id: orderId,
        userId,
      });

    if (!order) {
      throw new ApiError(
        "Order not found",
        404,
      );
    }

    
    if (
      order.paymentMethod !== "card"
    ) {
      throw new ApiError(
        "A payment intent can only be created for card orders",
        400,
      );
    }

    
    if (
      order.status === "canceled"
    ) {
      throw new ApiError(
        "Canceled order cannot be paid",
        400,
      );
    }

    
    if (
      order.paymentStatus === "paid" ||
      order.isPaid
    ) {
      throw new ApiError(
        "Order already paid",
        400,
      );
    }

    const amount =
      getStripeAmount(
        order.totalOrderPrice,
      );

    
    if (order.transactionId) {
      const existingPaymentIntent =
        await stripe.paymentIntents.retrieve(
          order.transactionId,
        );

      if (
        existingPaymentIntent.status ===
        "succeeded"
      ) {
        order.paymentStatus =
          "paid";

        order.isPaid = true;

        order.paidAt ??=
          new Date();

        await order.save();

        throw new ApiError(
          "Order already paid",
          400,
        );
      }

      
      if (
        existingPaymentIntent.status !==
          "canceled" &&
        existingPaymentIntent.amount ===
          amount &&
        existingPaymentIntent.currency ===
          "egp"
      ) {
        if (
          !existingPaymentIntent.client_secret
        ) {
          throw new ApiError(
            "Stripe payment client secret is unavailable",
            502,
          );
        }

        sendResponse(
          res,
          200,
          "Payment intent retrieved successfully",
          {
            clientSecret:
              existingPaymentIntent.client_secret,
          },
        );
      }
    }

    
    const paymentIntent =
      await stripe.paymentIntents.create(
        {
          amount,

          currency: "egp",

          payment_method_types: [
            "card",
          ],

          metadata: {
            orderId:
              order._id.toString(),

            userId,
          },
        },
      );

    if (
      !paymentIntent.client_secret
    ) {
      throw new ApiError(
        "Stripe did not return a payment client secret",
        502,
      );
    }

    
    order.transactionId =
      paymentIntent.id;

    order.paymentStatus =
      "pending";

    await order.save();

    sendResponse(
      res,
      200,
      "Payment intent created successfully",
      {
        clientSecret:
          paymentIntent.client_secret,
      },
    );
  });

