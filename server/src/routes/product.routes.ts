import express from 'express';
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct
} from '../controllers/product.controller.js';

import authentication from '../middlewares/authentication.js';
import { allowedTo } from '../middlewares/authorization.js';
import imageUpload from '../middlewares/uploadImage.js';

import validatorMiddleware from '../middlewares/validation.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validation.js';

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