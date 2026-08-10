import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../..", "logs");

const logEvents = async (
  message: string,
  logFileName: string
): Promise<void> => {
  const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");

  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  if (process.env.VERCEL) {
    console.log(`[LOG] ${logFileName}: ${message}`);
    return;
  }

  try {
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir, { recursive: true });
    }

    await fsPromises.appendFile(
      path.join(logsDir, logFileName),
      logItem
    );
  } catch (error) {
    console.error(error);
  }
};

const getRequestOrigin = (req: Request): string => {
  return req.headers.origin || req.get("host") || req.ip || "unknown origin";
};

const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = getRequestOrigin(req);

  res.on("finish", () => {
    void logEvents(
      `${req.method}\t${res.statusCode}\t${req.url}\t${origin}`,
      "reqLog.log"
    );
  });

  next();
};

export { logger, logEvents };