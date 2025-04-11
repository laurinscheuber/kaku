import { getRepository } from "typeorm";
import { User, UserRole } from "../entities/User";
import { auth, db } from "../config/firebase";

export class UserService {
  private userRepository = getRepository(User);

  async createOrUpdateUser(
    firebaseUid: string,
    userData: {
      email: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
    }
  ) {
    // Check if user exists in our database
    let user = await this.userRepository.findOne({
      where: { id: firebaseUid },
    });

    if (user) {
      // Update existing user
      user.email = userData.email;
      if (userData.firstName) user.firstName = userData.firstName;
      if (userData.lastName) user.lastName = userData.lastName;
      if (userData.role) user.role = userData.role;
    } else {
      // Create new user
      user = this.userRepository.create({
        id: firebaseUid,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role || UserRole.USER,
        isActive: true,
      });
    }

    return await this.userRepository.save(user);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.getUserById(id);

    user.role = role;

    // Update custom claims in Firebase
    await auth.setCustomUserClaims(id, { role });

    return await this.userRepository.save(user);
  }

  async deactivateUser(id: string) {
    const user = await this.getUserById(id);

    user.isActive = false;

    // Disable the user in Firebase
    await auth.updateUser(id, { disabled: true });

    return await this.userRepository.save(user);
  }

  async activateUser(id: string) {
    const user = await this.getUserById(id);

    user.isActive = true;

    // Enable the user in Firebase
    await auth.updateUser(id, { disabled: false });

    return await this.userRepository.save(user);
  }
}
