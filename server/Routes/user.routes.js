import express from 'express';
import {register, login, forgotPassword, verifyResetCode, resetPassword} from '../Controllers/user.controller.js'
import validationMiddleware from '../Middlewares/validation.middleware.js';
import { registerValidation, loginValidation } from '../validations/user.validation.js';
const userRouter = express.Router();

userRouter.post("/register", validationMiddleware(registerValidation), register);
userRouter.post("/login", validationMiddleware(loginValidation), login);
userRouter.route('/forgot-password').post(forgotPassword)
userRouter.route('/verify-reset-code').post(verifyResetCode)
userRouter.route('/reset-password').post(resetPassword)


export default userRouter;