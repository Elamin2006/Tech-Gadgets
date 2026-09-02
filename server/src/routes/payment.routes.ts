import express from "express";

import authentication from "../middlewares/authentication.js";
import validatorMiddleware from "../middlewares/validation.middleware.js";

import {
  orderIdParamsSchema,
} from "../validators/order.validation.js";

import {
  createPaymentIntent,
} from "../controllers/payment.controller.js";

const paymentRouter =
  express.Router();


paymentRouter.post(
  "/create-intent/:orderId",

  authentication,

  validatorMiddleware(
    orderIdParamsSchema,
    "params",
  ),

  createPaymentIntent,
);

export default paymentRouter;

