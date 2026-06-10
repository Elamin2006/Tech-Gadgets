import express from 'express';
import {register, login, forgotPassword, verifyResetCode, resetPassword} from '../Controllers/user.controller.js'
import { validateRegister, validateLogin } from '../Middlewares/auth.validation.js';

const userRouter = express.Router();

userRouter.post("/register", validateRegister, register);
userRouter.post("/login", validateLogin, login);
userRouter.route('/forgot-password').post(forgotPassword)
userRouter.route('/verify-reset-code').post(verifyResetCode)
userRouter.route('/reset-password').post(resetPassword)


export default userRouter;