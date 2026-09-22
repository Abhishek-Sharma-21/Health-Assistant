import express from "express";
import { prisma } from "../lib/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply protect & requireAdmin to ALL admin routes
router.use(protect, requireAdmin);

// Helper: create audit log entry
async function auditLog(adminUserId, action, targetUserId = null, metadata = null) {
  try {
    await prisma.auditLog.create({
      data: { adminUserId, action, targetUserId, metadata },
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

// Helper: check if user is the last admin
async function isLastAdmin(userId) {
  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return targetUser?.role === "admin";
  }
  return false;
}

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview metrics
// @access  Admin Only
router.get("/dashboard", async (req, res) => {
  try {
    const [totalUsers, activeUsers, blockedUsers, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      totalAdmins,
    });
  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    res.status(500).json({ error: "Failed to fetch admin metrics." });
  }
});

// @route   GET /api/admin/users
// @desc    Get paginated, searchable, filterable user list
// @access  Admin Only
router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
    const search = (req.query.search || "").trim();
    const role = req.query.role || "all";
    const status = req.query.status || "all";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role !== "all" && ["user", "admin"].includes(role)) {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "blocked") {
      where.isActive = false;
    }

    // Validate sort field
    const allowedSortFields = ["createdAt", "name", "email", "role"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Admin Users List Error:", err);
    res.status(500).json({ error: "Failed to fetch users list." });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Admin Only
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    console.error("Admin User Detail Error:", err);
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Toggle or update user active status (block/unblock)
// @access  Admin Only
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean." });
    }

    // Prevent deactivating own account
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot block your own account." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Safety: prevent blocking the last admin
    if (!isActive && targetUser.role === "admin") {
      const lastAdmin = await isLastAdmin(id);
      if (lastAdmin) {
        return res.status(400).json({ error: "Cannot block the last admin account." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
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

    // Audit log
    await auditLog(
      req.user.id,
      isActive ? "USER_UNBLOCKED" : "USER_BLOCKED",
      id,
      { targetEmail: targetUser.email, targetName: targetUser.name }
    );

    res.json({
      message: `User ${isActive ? "unblocked" : "blocked"} successfully.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Admin Status Update Error:", err);
    res.status(500).json({ error: "Failed to update user status." });
  }
});

// @route   PATCH /api/admin/profile
// @desc    Update admin's own profile (name)
// @access  Admin Only
router.patch("/profile", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
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

    res.json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (err) {
    console.error("Admin Profile Update Error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// @route   PATCH /api/admin/password
// @desc    Change admin's own password
// @access  Admin Only
router.patch("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const bcrypt = await import("bcryptjs");
    const isMatch = await bcrypt.default.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    await auditLog(req.user.id, "PASSWORD_CHANGED", req.user.id, { email: req.user.email });

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Admin Password Change Error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

// @route   GET /api/admin/audit-logs
// @desc    Get recent audit log entries
// @access  Admin Only
router.get("/audit-logs", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          adminUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Admin Audit Logs Error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs." });
  }
});

// @route   GET /api/admin/settings
// @desc    Get platform settings
// @access  Admin Only
router.get("/settings", async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });

    // Return defaults if no settings exist yet
    res.json({
      platformName: settingsObj.platformName || "HealthWise AI Assistant",
      aiModel: settingsObj.aiModel || "meta-llama/llama-3.3-70b-instruct:free",
      temperature: settingsObj.temperature || 0.3,
      rateLimit: settingsObj.rateLimit || 60,
      maintenanceMode: settingsObj.maintenanceMode || false,
    });
  } catch (err) {
    console.error("Admin Settings Get Error:", err);
    res.status(500).json({ error: "Failed to fetch settings." });
  }
});

// @route   PATCH /api/admin/settings
// @desc    Update platform settings
// @access  Admin Only
router.patch("/settings", async (req, res) => {
  try {
    const { platformName, aiModel, temperature, rateLimit, maintenanceMode } = req.body;

    const updates = [
      { key: "platformName", value: platformName || "HealthWise AI Assistant" },
      { key: "aiModel", value: aiModel || "meta-llama/llama-3.3-70b-instruct:free" },
      { key: "temperature", value: typeof temperature === "number" ? temperature : 0.3 },
      { key: "rateLimit", value: typeof rateLimit === "number" ? rateLimit : 60 },
      { key: "maintenanceMode", value: !!maintenanceMode },
    ];

    for (const { key, value } of updates) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await auditLog(req.user.id, "SETTINGS_UPDATED", null, { updatedKeys: updates.map((u) => u.key) });

    res.json({ message: "Settings updated successfully." });
  } catch (err) {
    console.error("Admin Settings Update Error:", err);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Admin Only
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { blogs: true } } },
    });
    res.json({ categories });
  } catch (err) {
    console.error("Admin Categories List Error:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// @route   POST /api/admin/categories
// @desc    Create a new category
// @access  Admin Only
router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Category name must be at least 2 characters." });
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Category with this name already exists." });
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });

    await auditLog(req.user.id, "CATEGORY_CREATED", null, { categoryId: category.id, name: category.name });

    res.status(201).json({ category });
  } catch (err) {
    console.error("Admin Category Create Error:", err);
    res.status(500).json({ error: "Failed to create category." });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category (only if no blogs assigned)
// @access  Admin Only
router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { blogs: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    if (category._count.blogs > 0) {
      return res.status(400).json({ error: "Cannot delete category with assigned blogs. Reassign blogs first." });
    }

    await prisma.category.delete({ where: { id } });
    await auditLog(req.user.id, "CATEGORY_DELETED", null, { categoryId: id, name: category.name });

    res.json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error("Admin Category Delete Error:", err);
    res.status(500).json({ error: "Failed to delete category." });
  }
});

// @route   GET /api/admin/blogs
// @desc    Get paginated blog list (admin sees all statuses)
// @access  Admin Only
router.get("/blogs", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
    const search = (req.query.search || "").trim();
    const status = req.query.status || "all";
    const categoryId = req.query.categoryId || "";

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status !== "all" && ["DRAFT", "PUBLISHED"].includes(status)) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      blogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Admin Blogs List Error:", err);
    res.status(500).json({ error: "Failed to fetch blogs." });
  }
});

// @route   GET /api/admin/blogs/:id
// @desc    Get single blog by ID
// @access  Admin Only
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    res.json({ blog });
  } catch (err) {
    console.error("Admin Blog Detail Error:", err);
    res.status(500).json({ error: "Failed to fetch blog." });
  }
});

// @route   POST /api/admin/blogs
// @desc    Create a new blog
// @access  Admin Only
router.post("/blogs", async (req, res) => {
  try {
    const { title, content, excerpt, status, isFeatured, categoryId } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return res.status(400).json({ error: "Title must be at least 3 characters." });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required." });
    }

    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug uniqueness
    const existingSlug = await prisma.blog.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(409).json({ error: "A blog with a similar title already exists. Please choose a different title." });
    }

    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!cat) {
        return res.status(400).json({ error: "Invalid category." });
      }
    }

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        isFeatured: !!isFeatured,
        authorId: req.user.id,
        categoryId: categoryId || null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    await auditLog(req.user.id, "BLOG_CREATED", null, { blogId: blog.id, title: blog.title });

    res.status(201).json({ blog });
  } catch (err) {
    console.error("Admin Blog Create Error:", err);
    res.status(500).json({ error: "Failed to create blog." });
  }
});

// @route   PUT /api/admin/blogs/:id
// @desc    Update a blog
// @access  Admin Only
router.put("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, status, isFeatured, categoryId } = req.body;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Blog not found." });
    }

    if (title && (typeof title !== "string" || title.trim().length < 3)) {
      return res.status(400).json({ error: "Title must be at least 3 characters." });
    }

    const data = {};
    if (title !== undefined) {
      data.title = title.trim();
      // Regenerate slug from new title
      const newSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (newSlug !== existing.slug) {
        const slugConflict = await prisma.blog.findFirst({ where: { slug: newSlug, id: { not: id } } });
        if (slugConflict) {
          return res.status(409).json({ error: "A blog with a similar title already exists." });
        }
        data.slug = newSlug;
      }
    }
    if (content !== undefined) data.content = content.trim();
    if (excerpt !== undefined) data.excerpt = excerpt?.trim() || null;
    if (status !== undefined) data.status = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;
    if (categoryId !== undefined) data.categoryId = categoryId || null;

    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) {
        return res.status(400).json({ error: "Invalid category." });
      }
    }

    const blog = await prisma.blog.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    await auditLog(req.user.id, "BLOG_UPDATED", null, { blogId: blog.id, title: blog.title });

    res.json({ blog });
  } catch (err) {
    console.error("Admin Blog Update Error:", err);
    res.status(500).json({ error: "Failed to update blog." });
  }
});

// @route   PATCH /api/admin/blogs/:id/status
// @desc    Toggle blog publish status
// @access  Admin Only
router.patch("/blogs/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["DRAFT", "PUBLISHED"].includes(status)) {
      return res.status(400).json({ error: "Status must be DRAFT or PUBLISHED." });
    }

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { status },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    await auditLog(req.user.id, status === "PUBLISHED" ? "BLOG_PUBLISHED" : "BLOG_UNPUBLISHED", null, { blogId: id, title: blog.title });

    res.json({ blog: updated });
  } catch (err) {
    console.error("Admin Blog Status Error:", err);
    res.status(500).json({ error: "Failed to update blog status." });
  }
});

// @route   PATCH /api/admin/blogs/:id/featured
// @desc    Toggle blog featured status
// @access  Admin Only
router.patch("/blogs/:id/featured", async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({ error: "isFeatured must be a boolean." });
    }

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    if (isFeatured && blog.status !== "PUBLISHED") {
      return res.status(400).json({ error: "Only published blogs can be featured." });
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { isFeatured },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    await auditLog(req.user.id, isFeatured ? "BLOG_FEATURED" : "BLOG_UNFEATURED", null, { blogId: id, title: blog.title });

    res.json({ blog: updated });
  } catch (err) {
    console.error("Admin Blog Featured Error:", err);
    res.status(500).json({ error: "Failed to update featured status." });
  }
});

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete a blog
// @access  Admin Only
router.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    await prisma.blog.delete({ where: { id } });
    await auditLog(req.user.id, "BLOG_DELETED", null, { blogId: id, title: blog.title });

    res.json({ message: "Blog deleted successfully." });
  } catch (err) {
    console.error("Admin Blog Delete Error:", err);
    res.status(500).json({ error: "Failed to delete blog." });
  }
});

// @route   GET /api/admin/test
// @desc    Test admin authorization (USER->403, ADMIN->200, Unauth->401)
// @access  Admin Only
router.get("/test", (req, res) => {
  res.json({ message: "Admin access verified.", user: req.user });
});

export default router;
