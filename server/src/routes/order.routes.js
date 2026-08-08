import express from "express";
import {
  createCashOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
} from "../controllers/order.controller.js";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validatorMiddleware from "../middlewares/validation.middleware.js";

import { createCashOrderSchema } from "../validators/order.validation.js";

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
