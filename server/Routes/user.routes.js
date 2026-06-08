import express from 'express';
import {register, login} from '../Controllers/user.controller.js'
import {validateRegister, validateLogin} from '../Middlewares/auth.validation.js';

const userRouter = express.Router();

userRouter.post("/register", validateRegister, register);
userRouter.post("/login", validateLogin, login);

export default userRouter;