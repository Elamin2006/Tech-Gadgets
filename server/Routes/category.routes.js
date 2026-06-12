import express from "express";
import {
    createCategory,
    getCategories,
    deleteCategory,
    getCategoryById,
} from "../Controllers/category.controller.js";

import authentication from "../middleware/authentication.js"; 
import { allowedTo } from "../middleware/authorization.js";

import validatorMiddleware from "../middleware/validatorMiddleware.js";
import { createCategorySchema } from "../middleware/validations/category.validation.js";

const categoryRouter = express.Router();

categoryRouter.route("/")
    .get(getCategories);

categoryRouter.route("/:id")
    .get(getCategoryById);

categoryRouter.use(authentication);

categoryRouter.route("/")
    .post(allowedTo("admin"), validatorMiddleware(createCategorySchema), createCategory);

categoryRouter.route("/:id")
    .delete(allowedTo("admin"), deleteCategory);

export default categoryRouter;