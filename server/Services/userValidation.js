import Joi from "joi";

let registerValidation = Joi.object({
    firstName: Joi.string().min(3).max(15).lowercase().required(),
    lastName: Joi.string().min(3).max(15).lowercase().required(),
    email: Joi.string().email().min(3).lowercase().required(),
    password: Joi.string().min(6).max(30).trim().required(),
    role: Joi.string().trim()
});

let loginValidation = Joi.object({
    email: Joi.string().email().min(3).lowercase().required(),
    password: Joi.string().min(6).max(30).trim().required(),
});

export { registerValidation, loginValidation };