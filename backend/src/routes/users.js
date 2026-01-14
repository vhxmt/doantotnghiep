import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import uploadService from "../services/uploadService.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User avatar management (for logged-in users)
router.post(
  "/avatar",
  uploadService.createUploadMiddleware({ subfolder: "users", maxFiles: 1 }),
  userController.uploadAvatar
);
router.delete("/avatar", userController.deleteAvatar);

// Admin routes - require admin role
router.use(authorize(["admin"]));

router.get("/", userController.getAllUsers);
router.get("/stats", userController.getUserStats);
router.get("/roles/all", userController.getAllRoles);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);
router.post("/:id/reset-password", userController.resetUserPassword);

export default router;
