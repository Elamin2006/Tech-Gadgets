import type { RequestHandler } from "express";
import Stripe from "stripe";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendRes.js";
import sendMail from "../utils/sendMail.js";

import stripe from "../config/stripe.js";
import config from "../config/env.js";

import Order from "../models/order.model.js";
import User from "../models/user.model.js";

import {
  buildPaymentSuccessMailOptions,
  buildPaymentFailureMailOptions,
} from "../services/emails.js";


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


const getPaymentMetadata = (
  paymentIntent: Stripe.PaymentIntent,
): {
  orderId: string;
  userId: string;
} => {
  const {
    orderId,
    userId,
  } = paymentIntent.metadata;

  if (
    !orderId ||
    !userId
  ) {
    throw new ApiError(
      "Stripe payment metadata is missing",
      400,
    );
  }

  return {
    orderId,
    userId,
  };
};


export const stripeWebhook: RequestHandler =
  asyncHandler(async (req, res) => {
    if (
      !config.STRIPE_WEBHOOK_SECRET
    ) {
      throw new ApiError(
        "Stripe webhook secret is not configured",
        500,
      );
    }

    const signature =
      req.headers[
        "stripe-signature"
      ];

    if (
      typeof signature !==
      "string"
    ) {
      throw new ApiError(
        "Missing Stripe webhook signature",
        400,
      );
    }

    let event: Stripe.Event;

   
    try {
      event =
        stripe.webhooks.constructEvent(
          req.body as Buffer,
          signature,
          config.STRIPE_WEBHOOK_SECRET,
        );
    } catch {
      throw new ApiError(
        "Invalid Stripe webhook signature",
        400,
      );
    }

    
    if (
      event.type !==
        "payment_intent.succeeded" &&
      event.type !==
        "payment_intent.payment_failed" &&
      event.type !==
        "payment_intent.canceled"
    ) {
      sendResponse(
        res,
        200,
        "Webhook event received",
        {
          received: true,
        },
      );
    }

    const paymentIntent =
      event.data.object as Stripe.PaymentIntent;

    const {
      orderId,
      userId,
    } =
      getPaymentMetadata(
        paymentIntent,
      );

    
    const order =
      await Order.findOne({
        _id: orderId,
        userId,
      });

    if (!order) {
      throw new ApiError(
        "Order associated with payment not found",
        404,
      );
    }

    
    const expectedAmount =
      getStripeAmount(
        order.totalOrderPrice,
      );

    if (
      paymentIntent.amount !==
        expectedAmount ||
      paymentIntent.currency !==
        "egp"
    ) {
      throw new ApiError(
        "Stripe payment amount or currency does not match the order",
        400,
      );
    }

    
    if (
      order.transactionId &&
      order.transactionId !==
        paymentIntent.id
    ) {
      throw new ApiError(
        "Stripe payment does not match the order transaction",
        400,
      );
    }

   
    order.transactionId =
      paymentIntent.id;

    if (
      event.type ===
      "payment_intent.succeeded"
    ) {
      
      const wasAlreadyPaid =
        order.paymentStatus ===
          "paid" ||
        order.isPaid;

      if (!wasAlreadyPaid) {
        order.paymentStatus =
          "paid";

        order.isPaid = true;

        order.paidAt ??=
          new Date();

        await order.save();

        
        const user =
          await User.findById(
            userId,
          ).select(
            "email username",
          );

        if (user?.email) {
          try {
            await sendMail(
              buildPaymentSuccessMailOptions(
                user.email,
                user.username,
                order._id.toString(),
                order.totalOrderPrice,
              ),
            );
          } catch (
            error: unknown
          ) {
            const message =
              error instanceof Error
                ? error.message
                : "Unknown email error";

            console.error(
              "Payment success email failed:",
              message,
            );
          }
        }
      }
    }

    
    else if (
      event.type ===
      "payment_intent.payment_failed"
    ) {
      
      if (
        order.paymentStatus !==
        "paid"
      ) {
        const wasAlreadyFailed =
          order.paymentStatus ===
          "failed";

        order.paymentStatus =
          "failed";

        order.isPaid = false;

        await order.save();

        
        if (!wasAlreadyFailed) {
          const user =
            await User.findById(
              userId,
            ).select(
              "email username",
            );

          if (user?.email) {
            try {
              await sendMail(
                buildPaymentFailureMailOptions(
                  user.email,
                  user.username,
                  order._id.toString(),
                ),
              );
            } catch (
              error: unknown
            ) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Unknown email error";

              console.error(
                "Payment failure email failed:",
                message,
              );
            }
          }
        }
      }
    }


    else if (
      event.type ===
      "payment_intent.canceled"
    ) {
      
      if (
        order.paymentStatus !==
        "paid"
      ) {
        order.paymentStatus =
          "failed";

        order.isPaid = false;

        await order.save();
      }
    }

    return sendResponse(
      res,
      200,
      "Webhook processed successfully",
      {
        received: true,
      },
    );
  });

