import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../entities/User";

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password strength
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      const result = await this.authService.register(
        firstName,
        lastName,
        email,
        password,
        role || UserRole.USER
      );

      return res.status(201).json(result);
    } catch (error) {
      if (error.message === "User already exists") {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const result = await this.authService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      if (
        error.message === "User not found" ||
        error.message === "Invalid password"
      ) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
