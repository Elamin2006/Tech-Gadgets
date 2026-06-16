import joi from 'joi';

export const createCashOrderSchema = joi.object({
    shippingAddress: joi.object({
        details: joi.string().min(5).max(200).trim().required()
            .messages({
                'string.empty': 'Shipping details cannot be empty',
                'string.min': 'Shipping details must be at least 5 characters long'
            }),
        phone: joi.string().
        // regex(/^01[0125][0-9]{8}$/).
        required() 
            .messages({
                'string.pattern.base': 'Please enter a valid phone number'
            }),
        city: joi.string().min(2).max(50).trim().required()
            .messages({
                'string.empty': 'City name is required'
            })
    }).required()
});