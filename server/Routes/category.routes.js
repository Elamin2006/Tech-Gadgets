import express from "express";
import {
    createCategory,
    getCategories,
    deleteCategory,
    getCategoryById,
} from "../Controllers/category.controller.js";

import authentication from "../Middlewares/authentication.js";
import { allowedTo } from "../Middlewares/authorization.js";

import validatorMiddleware from "../Middlewares/validation.middleware.js";
import { createCategorySchema } from "../validations/category.validation.js";

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