import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Helper to generate JWT Token & set HttpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  const token = jwt.sign({ id: user.id, role: user.role }, secret, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("auth_token", token, cookieOptions);

  res.status(statusCode).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Strictly role="user")
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // SECURITY: Public registration ALWAYS assigns role="user" regardless of payload
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: passwordHash,
        role: "user", // Hardcoded security enforcement
        isActive: true,
      },
    });

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Failed to register user. Please try again." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user or super_admin via single form
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find User in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account has been deactivated. Please contact administrator." });
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Login success: send JWT token & safe user payload (determined from database role)
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Failed to authenticate. Please try again." });
  }
});

// @route   POST /api/auth/logout
// @desc    Clear auth cookie & session
// @access  Public
router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully." });
});

// @route   GET /api/auth/me
// @desc    Get authenticated user session details
// @access  Protected
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
