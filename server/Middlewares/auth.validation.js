import { registerValidation, loginValidation } from "../Services/userValidation.js";
import ApiError from "../Utils/apiError.js";

function validateRegister(req, res, next) {
    const { error } = registerValidation.validate(req.body);
    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }
    next();
}

function validateLogin(req, res, next) {
    const { error } = loginValidation.validate(req.body);
    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }
    next();
}

export { validateRegister, validateLogin };