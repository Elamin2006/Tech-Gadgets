import type { RequestHandler } from "express";
import type { ObjectSchema } from "joi";

import ApiError from "../utils/apiError.js";

const validatorMiddleware = (
  schema: ObjectSchema,
): RequestHandler => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return next(
        new ApiError(
          error.details[0].message,
          400,
        ),
      );
    }

    next();
  };
};

export default validatorMiddleware;