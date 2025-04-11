import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  verifyFirebaseToken,
  authorizeRole,
} from "../middlewares/firebase-auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();
const userController = new UserController();

// Public routes
router.post("/register", userController.registerUser);

// Protected routes (authenticated users)
router.get("/profile", verifyFirebaseToken, userController.getUserProfile);

// Admin only routes
router.get(
  "/",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  userController.getAllUsers
);
router.put(
  "/:userId/role",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  userController.updateUserRole
);
router.put(
  "/:userId/deactivate",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  userController.deactivateUser
);
router.put(
  "/:userId/activate",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  userController.activateUser
);

export default router;
