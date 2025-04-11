import { getRepository } from "typeorm";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../entities/User";
import { generateToken } from "../utils/jwt";

export class AuthService {
  private userRepository = getRepository(User);

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER
  ) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(user);

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }
}
