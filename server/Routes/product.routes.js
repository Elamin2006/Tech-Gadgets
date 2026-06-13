import express from 'express';
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct
} from '../Controllers/product.controller.js';

import authentication from '../middleware/authentication.js';
import { allowedTo } from '../middleware/authorization.js';
import imageUpload from '../middleware/uploadImage.js';

import validatorMiddleware from '../middleware/validatorMiddleware.js';
import { createProductSchema, updateProductSchema } from '../middleware/validations/product.validation.js';

const productRouter = express.Router();

productRouter.route('/')
    .get(getAllProducts);

productRouter.route('/:id')
    .get(getProductById);

productRouter.use(authentication);

productRouter.route('/')
    .post(
        allowedTo('admin'),
        imageUpload.single('image'),
        validatorMiddleware(createProductSchema),
        createProduct
    );

productRouter.route('/:id')
    .patch(
        allowedTo('admin'),
        imageUpload.single('image'),
        validatorMiddleware(updateProductSchema),
        updateProduct
    )
    .delete(allowedTo('admin'), deleteProduct);

export default productRouter;