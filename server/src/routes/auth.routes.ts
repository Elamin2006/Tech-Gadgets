import { Router } from "express";

import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  sendRegisterOTP,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changeRole,
} from "../controllers/auth.controller.js";

import {
  registerValidation,
  loginValidation,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changeRoleSchema,
} from "../validators/auth.validation.js";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validationMiddleware(registerValidation, "body"),
  sendRegisterOTP,
);

authRouter.post(
  "/verify-otp",
  validationMiddleware(verifyOtpSchema),
  verifyOTP,
);

authRouter.post(
  "/login",
  validationMiddleware(loginValidation),
  login,
);

authRouter.post(
  "/logout",
  logout,
);

authRouter.post(
  "/forgot-password",
  validationMiddleware(
    forgotPasswordSchema,
  ),
  forgotPassword,
);

authRouter.post(
  "/reset-password",
  validationMiddleware(
    resetPasswordSchema,
  ),
  resetPassword,
);

authRouter.patch(
  "/change-role",
  authentication,
  allowedTo("admin"),
  validationMiddleware(
    changeRoleSchema,
  ),
  changeRole,
);

export default authRouter;