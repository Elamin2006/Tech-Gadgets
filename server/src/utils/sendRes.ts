import type { Response } from "express";

interface ResponseData {
  [key: string]: unknown;
}

const sendResponse = (
  response: Response,
  statusCode: number,
  message: string,
  data: ResponseData = {},
): Response => {
  return response.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

export default sendResponse;