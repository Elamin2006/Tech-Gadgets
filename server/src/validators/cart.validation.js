import joi from 'joi';

const objectIdPattern = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"productId" must be a valid Mongo Object ID');
    }
    return value;
};

export const addToCartSchema = joi.object({
    productId: joi.string().custom(objectIdPattern).required(),
    quantity: joi.number().integer().min(1).optional().default(1)
});

export const updateCartItemQuantitySchema = joi.object({
    quantity: joi.number().integer().min(1).required()
});