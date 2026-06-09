import express from "express";
import dotenv from "dotenv";
import { DBConnection } from "./Database/mongoose.js";
import morgan from "morgan";
import { logger } from "./Utils/logger.js";
import userRouter from "./Routes/user.routes.js";
import errorHandler from "./Middlewares/errorHandler.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(express.json());
app.use(logger);

app.use("/api/users", userRouter);

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