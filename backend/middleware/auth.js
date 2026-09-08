import jwt from "jsonwebtoken";
import { prisma } from "../lib/db.js";

// Authentication Middleware: Verifies JWT token and attaches user to req.user
export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.auth_token;

    // Fallback to Bearer token header if provided
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing." });
    }

    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, secret);

    // Retrieve fresh user from PostgreSQL to verify active status & true role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User session not found or deleted." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth protection error:", err.message);
    return res.status(401).json({ error: "Not authorized, invalid or expired session token." });
  }
};

// Authorization Middleware: Ensures authenticated user is a super_admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized." });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: Super Admin privileges required." });
  }

  next();
};
