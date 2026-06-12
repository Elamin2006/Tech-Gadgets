import joi from 'joi';
import ApiError from '../Utils/ApiError.js'; 

export const createCategorySchema = joi.object({
    name: joi.string().min(3).max(15).lowercase().trim().required(),
});

export const verifyCategory = (req, res, next) => {
    try {
        const { error } = createCategorySchema.validate(req.body);
        
        if (error) {
            const errMsg = error.details[0].message;
            throw new ApiError(errMsg, 400); 
        } 
        
        next();
    } catch (error) {
        next(error);
    }
};