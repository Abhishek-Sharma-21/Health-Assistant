import express from "express";
import { prisma } from "../lib/db.js";

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get published blogs (public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 12));
    const search = (req.query.search || "").trim();
    const categoryId = req.query.categoryId || "";

    const where = { status: "PUBLISHED" };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { name: true } },
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
    console.error("Public Blogs List Error:", err);
    res.status(500).json({ error: "Failed to fetch blogs." });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured published blogs
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 6));

    const blogs = await prisma.blog.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json({ blogs });
  } catch (err) {
    console.error("Public Featured Blogs Error:", err);
    res.status(500).json({ error: "Failed to fetch featured blogs." });
  }
});

// @route   GET /api/blogs/categories
// @desc    Get all categories with blog counts
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { blogs: { where: { status: "PUBLISHED" } } } },
      },
    });
    res.json({ categories });
  } catch (err) {
    console.error("Public Categories Error:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single published blog by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    res.json({ blog });
  } catch (err) {
    console.error("Public Blog Detail Error:", err);
    res.status(500).json({ error: "Failed to fetch blog." });
  }
});

export default router;
