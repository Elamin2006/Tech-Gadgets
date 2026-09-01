import express from "express";

import authentication from "../middlewares/authentication.js";

import {
  allowedTo,
} from "../middlewares/authorization.js";

import validatorMiddleware from "../middlewares/validation.middleware.js";

import {
  createOrderSchema,
  getAllOrdersSchema,
  getMyOrdersSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from "../validators/order.validation.js";

import {
  createCashOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
  cancelMyOrder,
} from "../controllers/order.controller.js";

const orderRouter =
  express.Router();

orderRouter.use(
  authentication,
);

orderRouter
  .route("/")
  .post(
    validatorMiddleware(
      createOrderSchema,
    ),
    createCashOrder,
  )
  .get(
    validatorMiddleware(
      getAllOrdersSchema,
      "query",
    ),
    getAllOrders,
  );

orderRouter
  .route("/my-orders")
  .get(
    validatorMiddleware(
      getMyOrdersSchema,
      "query",
    ),
    getMyOrders,
  );

orderRouter
  .route("/my/:orderId/cancel")
  .patch(
    validatorMiddleware(
      orderIdParamsSchema,
      "params",
    ),
    cancelMyOrder,
  );

orderRouter
  .route("/:orderId")
  .get(
    validatorMiddleware(
      orderIdParamsSchema,
      "params",
    ),
    getOrderById,
  )

  .patch(
    allowedTo("admin"),

    validatorMiddleware(
      orderIdParamsSchema,
      "params",
    ),

    validatorMiddleware(
      updateOrderStatusSchema,
    ),

    updateOrderStatus,
  )

  .delete(
    allowedTo("admin"),

    validatorMiddleware(
      orderIdParamsSchema,
      "params",
    ),

    deleteOrderById,
  );

export default orderRouter;