import express from "express";
import dotenv from "dotenv";
import { DBConnection } from "./Database/mongoose.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

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