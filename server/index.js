// imports & confi
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { DBConnection } from "./config/mongoose.js";
import morgan from "morgan";
import { logger } from "./Utils/logger.js";
import userRouter from "./Routes/user.routes.js";
import categoryRouter from "./Routes/category.routes.js";
import productRouter from "./Routes/product.routes.js";
import cartRouter from "./Routes/cart.routes.js";
import orderRouter from "./Routes/order.routes.js";
import adminRouter from "./Routes/admin.routes.js";
import errorHandler from "./Middlewares/errorHandler.js";
import ApiError from "./Utils/apiError.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const apiVersion = "/api/v1";

// global middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json(corsOptions));
app.use(logger);
app.use(cors());

// Routes
app.use(`${apiVersion}/users`, userRouter);
app.use(`${apiVersion}/categories`, categoryRouter);
app.use(`${apiVersion}/products`, productRouter);
app.use(`${apiVersion}/cart`, cartRouter);
app.use(`${apiVersion}/orders`, orderRouter);
app.use(`${apiVersion}/admin`, adminRouter);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(
    new ApiError(`Can't find this route:${req.method} ${req.originalUrl}`, 404),
  );
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
    process.exit(1);
  }
}

startServer();

export default app;
