import express from "express";
import morgan from "morgan";
import cors from "cors";

import { logger } from "./utils/logger.js";
import corsOptions from "./config/corsOptions.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import orderRouter from "./routes/order.routes.js";
import adminRouter from "./routes/admin.routes.js";

import errorHandler from "./middlewares/errorHandler.js";
import ApiError from "./utils/apiError.js";

const app = express();

const apiVersion = "/api/v2";

// Global middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(logger);
app.use(cors(corsOptions));

// Routes
app.use(`${apiVersion}/auth`, authRouter);
app.use(`${apiVersion}/users`, userRouter);
app.use(`${apiVersion}/categories`, categoryRouter);
app.use(`${apiVersion}/products`, productRouter);
app.use(`${apiVersion}/cart`, cartRouter);
app.use(`${apiVersion}/coupons`, couponRouter);
app.use(`${apiVersion}/orders`, orderRouter);
app.use(`${apiVersion}/admin`, adminRouter);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(
    new ApiError(
      `Can't find this route: ${req.method} ${req.originalUrl}`,
      404
    )
  );
});

// Global error handler
app.use(errorHandler);

export default app;