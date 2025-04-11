import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route example
router.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin only route example
router.get("/users", authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
