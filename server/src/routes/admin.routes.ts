import express from "express";
import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

import {
  getDashboardStats,
  getSalesPerformance,
  getRecentActivityLog,
} from "../controllers/admin/dashboard.controller.js";

import {
  deleteUserAccount,
  getAllUsers,
  getUserById,
  toggleUserBanStatus,
  updateUserRole,
} from "../controllers/admin/user.controller.js";

import {
  adminUserRoleSchema,
  adminUserStatusSchema,
  adminUsersQuerySchema,
  userIdSchema,
} from "../validators/user.validation.js";

const adminRouter = express.Router();

adminRouter.use(authentication);
adminRouter.use(allowedTo("admin"));

adminRouter.get("/dashboard/stats", getDashboardStats);
adminRouter.get("/dashboard/sales", getSalesPerformance);
adminRouter.get("/dashboard/activity", getRecentActivityLog);

adminRouter.get("/users",
  validationMiddleware(adminUsersQuerySchema,"query"), 
  getAllUsers);

adminRouter.get("/users/:id",
  validationMiddleware(userIdSchema, "params"),
  getUserById);

adminRouter.patch("/users/:id/role", 
  validationMiddleware(userIdSchema, "params"),
  validationMiddleware(adminUserRoleSchema, "body"),
   updateUserRole);

adminRouter.patch("/users/:id/status", 
  validationMiddleware(userIdSchema,"params",),
validationMiddleware(adminUserStatusSchema, "body"),
 toggleUserBanStatus);

adminRouter.delete("/users/:id",
 validationMiddleware(userIdSchema, "params"),
 deleteUserAccount);

export default adminRouter;
