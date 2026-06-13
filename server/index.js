import express from "express";
import dotenv from "dotenv";
import { DBConnection } from "./Database/mongoose.js";
import morgan from "morgan";
import { logger } from "./Utils/logger.js";
import userRouter from "./Routes/user.routes.js";
import categoryRouter from "./Routes/category.routes.js";
import errorHandler from "./Middlewares/errorHandler.js";
import ApiError from "./Utils/ApiError.js";
import {fileURLToPath} from "url";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const apiVersion = "/api/v1";

app.use(morgan("dev"));
app.use(express.json());
app.use(logger);

app.use(`${apiVersion}/users`, userRouter);
app.use(`${apiVersion}/categories`, categoryRouter);

app.use((req, res, next) => {
  next(new ApiError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});
app.use(errorHandler);

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