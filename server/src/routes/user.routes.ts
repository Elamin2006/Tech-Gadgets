import { Router } from "express";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  addUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  addUserSchema,
  userIdSchema,
  updateUserSchema,
} from "../validators/user.validation.js";

const userRouter = Router();

userRouter.post(
  "/",
  authentication,
  allowedTo("admin"),
  validationMiddleware(addUserSchema),
  addUser,
);

userRouter.get(
  "/",
  authentication,
  allowedTo("admin"),
  getAllUsers,
);

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

userRouter.delete(
  "/:id",
  authentication,
  allowedTo("admin"),
  validationMiddleware(
    userIdSchema,
    "params",
  ),
  deleteUser,
);

export default userRouter;