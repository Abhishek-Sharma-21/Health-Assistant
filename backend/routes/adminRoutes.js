import express from "express";
import { prisma } from "../lib/db.js";
import { protect, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply protect & requireSuperAdmin to ALL admin routes
router.use(protect, requireSuperAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get Super Admin dashboard overview metrics
// @access  Super Admin Only
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const superAdmins = await prisma.user.count({ where: { role: "super_admin" } });

    res.json({
      metrics: {
        totalUsers,
        activeUsers,
        superAdmins,
        systemStatus: "Healthy",
        databaseProvider: "Neon PostgreSQL",
      },
    });
  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    res.status(500).json({ error: "Failed to fetch admin metrics." });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all users
// @access  Super Admin Only
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users });
  } catch (err) {
    console.error("Admin Users Error:", err);
    res.status(500).json({ error: "Failed to fetch users list." });
  }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Toggle or update user active status
// @access  Super Admin Only
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent deactivating own account
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot deactivate your own Super Admin account." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const newStatus = typeof isActive === "boolean" ? isActive : !targetUser.isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ message: `User status updated to ${newStatus ? 'Active' : 'Inactive'}`, user: updatedUser });
  } catch (err) {
    console.error("Admin Status Update Error:", err);
    res.status(500).json({ error: "Failed to update user status." });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Super Admin Only
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "User account deleted successfully." });
  } catch (err) {
    console.error("Admin User Delete Error:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
