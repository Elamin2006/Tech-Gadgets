import joi from 'joi';

export const createProductSchema = joi.object({
    name: joi.string().min(3).max(100).lowercase().trim().required(),
    description: joi.string().min(10).trim().required(),
    categoryId: joi.string().hex().length(24).required(),
    price: joi.number().positive().required(), 
    discount: joi.number().min(0).max(100).optional(), 
    quantity: joi.number().integer().min(0).optional() 
});

export const updateProductSchema = joi.object({
    name: joi.string().min(3).max(100).lowercase().trim(),
    description: joi.string().min(10).trim(),
    categoryId: joi.string().hex().length(24),
    price: joi.number().positive(),
    discount: joi.number().min(0).max(100),
    quantity: joi.number().integer().min(0)
});
