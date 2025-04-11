import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { FirebaseAuthRequest } from "../middlewares/firebase-auth.middleware";
import { UserRole } from "../entities/User";
import { auth } from "../config/firebase";

export class UserController {
  private userService = new UserService();

  async registerUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Create user in Firebase
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName || ""} ${lastName || ""}`.trim(),
        disabled: false,
      });

      // Set custom claims (role)
      await auth.setCustomUserClaims(userRecord.uid, {
        role: role || UserRole.USER,
      });

      // Create or update user in our database
      const user = await this.userService.createOrUpdateUser(userRecord.uid, {
        email,
        firstName,
        lastName,
        role: role || UserRole.USER,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  }

  async getUserProfile(req: FirebaseAuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;

      const user = await this.userService.getUserById(userId);

      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllUsers(req: FirebaseAuthRequest, res: Response) {
    try {
      const users = await this.userService.getAllUsers();

      return res.status(200).json(
        users.map((user) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        }))
      );
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUserRole(req: FirebaseAuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !Object.values(UserRole).includes(role)) {
        return res.status(400).json({ message: "Valid role is required" });
      }

      const user = await this.userService.updateUserRole(userId, role);

      return res.status(200).json({
        message: "User role updated successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deactivateUser(req: FirebaseAuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await this.userService.deactivateUser(userId);

      return res.status(200).json({
        message: "User deactivated successfully",
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async activateUser(req: FirebaseAuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await this.userService.activateUser(userId);

      return res.status(200).json({
        message: "User activated successfully",
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
