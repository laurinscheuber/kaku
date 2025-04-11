import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { UserRole } from "../entities/User";

export interface FirebaseAuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: UserRole;
  };
}

export const verifyFirebaseToken = async (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decodedToken = await auth.verifyIdToken(token);

    // Set user information in the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role: (decodedToken.role as UserRole) || UserRole.USER,
    };

    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: FirebaseAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role || UserRole.USER)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  };
};
