import validatorMiddleware from './validation.middleware.js';
import { registerValidation, loginValidation } from '../validations/user.validation.js';

export const validateRegister = validatorMiddleware(registerValidation);
export const validateLogin = validatorMiddleware(loginValidation);

export default { validateRegister, validateLogin };
