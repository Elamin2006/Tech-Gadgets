import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";
import { DBConnection } from "./src/config/mongoose.js";
import { logEvents } from "./src/utils/logger.js";

const port = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await DBConnection();

    app.listen(port, () => {
      void logEvents(
        `Server is running on port ${port}`,
        "serverLog.log",
      );
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error);

    void logEvents(
      `Error starting server: ${message}`,
      "serverLog.log",
    );

    process.exit(1);
  }
}

startServer();