import { registerValidation, loginValidation } from "../Services/userValidation.js";
function validateRegister(req, res, next) {
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

function validateLogin(req, res, next) {
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

export { validateRegister, validateLogin };