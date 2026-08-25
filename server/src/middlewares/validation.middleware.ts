import type {
  RequestHandler,
} from "express";

import type {
  ZodType,
} from "zod";

import ApiError from "../utils/apiError.js";

type ValidationTarget =
  | "body"
  | "params"
  | "query";

const validationMiddleware = (
  schema: ZodType,
  target: ValidationTarget = "body",
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(
      req[target],
    );

    if (!result.success) {
      const errorMessage =
        result.error.issues
          .map(
            (issue) =>
              issue.message,
          )
          .join(", ");

      return next(
        new ApiError(
          errorMessage ||
            "Invalid request data",
          400,
        ),
      );
    }

    req[target] = result.data;

    next();
  };
};

export default validationMiddleware;