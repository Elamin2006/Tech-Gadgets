import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";
import { DBConnection } from "./src/config/mongoose.js";

const port = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
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