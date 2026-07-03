import express from "express";
import {
    createCashOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrderById
} from "../Controllers/order.controller.js";

// الـ Middlewares العامة وجدار الحماية
import authentication from "../Middlewares/authentication.js";
import { allowedTo } from "../Middlewares/authorization.js";
import validatorMiddleware from "../Middlewares/validation.middleware.js";

// الـ Validation Schema الخاصة بالطلب التي كتبناها سابقاً
import { createCashOrderSchema } from "../validations/order.validation.js";

const orderRouter = express.Router();

// 🔒 جدار حماية إجباري - لا يمكن لأي زائر التعامل مع الطلبات بدون تسجيل دخول
orderRouter.use(authentication);

// 🛍️ 1. مسار إنشاء طلب كاش (للمستخدم المسجل)
orderRouter.route("/")
    .post(validatorMiddleware(createCashOrderSchema), createCashOrder)
    .get(getAllOrders); // المستخدم يرى طلباته، والأدمن يرى الكل

orderRouter.route("/:orderId")
    .get(getOrderById) // المستخدم يرى طلبه فقط، والأدمن يرى أي طلب
    .patch(allowedTo("admin"), updateOrderStatus) // تحديث حالة الدفع أو التوصيل
    .delete(allowedTo("admin"), deleteOrderById); // حذف أو إلغاء طلب

export default orderRouter;