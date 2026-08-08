import express from "express";
import {
    createCategory,
    getCategories,
    deleteCategory,
    getCategoryById,
} from "../controllers/category.controller.js";

import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";

import validatorMiddleware from "../middlewares/validation.middleware.js";
import { createCategorySchema } from "../validators/category.validation.js";

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