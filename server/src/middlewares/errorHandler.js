import { logEvents } from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || "Internal server error";
  const origin = req.headers.origin || req.get("host") || req.ip || "unknown origin";

  logEvents(`${err.name || "Error"}: ${message}\t${req.method}\t${statusCode}\t${req.url}\t${origin}`, "errolog.log");
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;