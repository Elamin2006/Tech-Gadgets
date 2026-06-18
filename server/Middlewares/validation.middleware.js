import ApiError from '../Utils/apiError.js';

const validatorMiddleware = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const errMsg = error.details[0].message;
            return next(new ApiError(errMsg, 400)); 
        }
        
        next();
    };
};

export default validatorMiddleware;