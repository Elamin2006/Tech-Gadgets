// imports & confi
import express from "express";
import dotenv from "dotenv";
import { DBConnection } from "./Database/mongoose.js";
import morgan from "morgan";
import { logger } from "./Utils/logger.js";
import userRouter from "./Routes/user.routes.js";
import categoryRouter from "./Routes/category.routes.js";
import productRouter from "./Routes/product.routes.js";
import cartRouter from "./Routes/cart.routes.js";
import orderRouter from "./Routes/order.routes.js";
import errorHandler from "./Middlewares/errorHandler.js";
import ApiError from "./Utils/ApiError.js";
import path from "path";
import {fileURLToPath} from "url";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const apiVersion = "/api/v1";

// global middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(logger);

// Routes
app.use(`${apiVersion}/users`, userRouter);
app.use(`${apiVersion}/categories`, categoryRouter);
app.use(`${apiVersion}/products`, productRouter);
app.use(`${apiVersion}/cart`, cartRouter);
app.use(`${apiVersion}/orders`, orderRouter);

app.use("/Uploads", express.static(path.join(path.resolve(), "Uploads")));
// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this route:${req.method} ${req.originalUrl}`, 404));
});
// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await DBConnection();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();