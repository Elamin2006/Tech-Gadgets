import express from "express";
import authentication from "../Middlewares/authentication.js";
import { allowedTo } from "../Middlewares/authorization.js";
import {
  getDashboardStats,
  getSalesPerformance,
  getRecentActivityLog,
} from "../Controllers/admin/dashboard.controller.js";
import {
  deleteUserAccount,
  getAllUsers,
  getUserById,
  toggleUserBanStatus,
  updateUserRole,
} from "../Controllers/admin/user.controller.js";

const router = express.Router();

router.use(authentication);
router.use(allowedTo("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/sales", getSalesPerformance);
router.get("/dashboard/activity", getRecentActivityLog);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserBanStatus);
router.delete("/users/:id", deleteUserAccount);

export default router;
