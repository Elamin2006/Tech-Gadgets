import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { DBConnection } from "./src/config/mongoose.js";
import { logger } from "./src/utils/logger.js";

const port = process.env.PORT || 5000;


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

