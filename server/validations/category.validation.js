import joi from 'joi';
import ApiError from '../Utils/ApiError.js'; 

export const createCategorySchema = joi.object({
    name: joi.string().min(3).max(15).lowercase().trim().required(),
});

