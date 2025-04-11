import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import {
  verifyFirebaseToken,
  authorizeRole,
} from "../middlewares/firebase-auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();
const taskController = new TaskController();

// Public routes
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);

// Protected routes (authenticated users)
router.post("/", verifyFirebaseToken, taskController.createTask);
router.put("/:id", verifyFirebaseToken, taskController.updateTask);
router.delete("/:id", verifyFirebaseToken, taskController.deleteTask);

// Task management
router.post("/:taskId/assign", verifyFirebaseToken, taskController.assignTask);
router.put(
  "/:taskId/status",
  verifyFirebaseToken,
  taskController.updateTaskStatus
);

// Admin only routes
router.get(
  "/admin/all",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  taskController.getAllTasks
);

export default router;
