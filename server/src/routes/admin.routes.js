import express from "express";
import authentication from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
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
