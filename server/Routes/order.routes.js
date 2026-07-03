import express from "express";
import {
  createCashOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
} from "../Controllers/order.controller.js";

import authentication from "../Middlewares/authentication.js";
import { allowedTo } from "../Middlewares/authorization.js";
import validatorMiddleware from "../Middlewares/validation.middleware.js";

import { createCashOrderSchema } from "../validations/order.validation.js";

const orderRouter = express.Router();

orderRouter.use(authentication);

orderRouter
  .route("/")
  .post(validatorMiddleware(createCashOrderSchema), createCashOrder)
  .get(getAllOrders);

orderRouter
  .route("/:orderId")
  .get(getOrderById) 
  .patch(allowedTo("admin"), updateOrderStatus) 
  .delete(allowedTo("admin"), deleteOrderById); 
  
export default orderRouter;
