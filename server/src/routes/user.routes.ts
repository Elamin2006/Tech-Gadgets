import { Router } from "express";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";

import {
  userIdSchema,
  updateUserSchema,
} from "../validators/user.validation.js";

const userRouter = Router();


userRouter.get(
  "/:id",
  authentication,
  validationMiddleware(
    userIdSchema,
    "params",
  ),
  getUserById,
);

userRouter.patch(
  "/:id",
  authentication,
  validationMiddleware(
    userIdSchema,
    "params",
  ),
  validationMiddleware(
    updateUserSchema,
    "body",
  ),
  updateUser,
);


export default userRouter;