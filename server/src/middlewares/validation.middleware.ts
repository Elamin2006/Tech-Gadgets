import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import ApiError from "../utils/apiError.js";

const validatorMiddleware = (
  schema: ZodType,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message ?? "Invalid request data";

      return next(new ApiError(errorMessage, 400));
    }

    req.body = result.data;

    next();
  };
};

export default validatorMiddleware;