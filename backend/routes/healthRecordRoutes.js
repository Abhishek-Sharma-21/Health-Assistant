import express from "express";
import { prisma } from "../lib/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const VALID_RECORD_TYPES = ["DOCTOR_VISIT", "DIAGNOSIS", "LAB_TEST", "VACCINATION", "SURGERY", "OTHER"];

function validate(data) {
  const errors = [];

  if (!data.recordType || !VALID_RECORD_TYPES.includes(data.recordType)) {
    errors.push(`Record type must be one of: ${VALID_RECORD_TYPES.join(", ")}`);
  }

  if (!data.title || typeof data.title !== "string" || data.title.trim().length < 2) {
    errors.push("Title must be at least 2 characters.");
  }

  if (!data.recordDate) {
    errors.push("Record date is required.");
  } else {
    const d = new Date(data.recordDate);
    if (isNaN(d.getTime())) {
      errors.push("Record date must be a valid date.");
    }
  }

  if (data.doctorName !== undefined && data.doctorName !== null && typeof data.doctorName !== "string") {
    errors.push("Doctor name must be text.");
  }

  if (data.hospitalName !== undefined && data.hospitalName !== null && typeof data.hospitalName !== "string") {
    errors.push("Hospital name must be text.");
  }

  if (data.diagnosis !== undefined && data.diagnosis !== null && typeof data.diagnosis !== "string") {
    errors.push("Diagnosis must be text.");
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== "string") {
    errors.push("Description must be text.");
  }

  if (data.notes !== undefined && data.notes !== null && typeof data.notes !== "string") {
    errors.push("Notes must be text.");
  }

  return errors;
}

function buildData(body) {
  const data = {};
  if (body.recordType !== undefined) data.recordType = body.recordType;
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.recordDate !== undefined) data.recordDate = new Date(body.recordDate);
  if (body.doctorName !== undefined) data.doctorName = body.doctorName?.trim() || null;
  if (body.hospitalName !== undefined) data.hospitalName = body.hospitalName?.trim() || null;
  if (body.diagnosis !== undefined) data.diagnosis = body.diagnosis?.trim() || null;
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  return data;
}

// @route   GET /api/health-records
// @desc    Get authenticated user's health records
// @access  Authenticated User
router.get("/", protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
    const search = (req.query.search || "").trim();
    const recordType = req.query.recordType || "";

    const where = { userId: req.user.id };

    if (recordType && VALID_RECORD_TYPES.includes(recordType)) {
      where.recordType = recordType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { doctorName: { contains: search, mode: "insensitive" } },
        { hospitalName: { contains: search, mode: "insensitive" } },
        { diagnosis: { contains: search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.healthRecord.findMany({
        where,
        orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.healthRecord.count({ where }),
    ]);

    res.json({
      records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Get Health Records Error:", err);
    res.status(500).json({ error: "Failed to fetch health records." });
  }
});

// @route   GET /api/health-records/:id
// @desc    Get single health record by ID
// @access  Authenticated User (own records only)
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await prisma.healthRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({ error: "Health record not found." });
    }

    if (record.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json({ record });
  } catch (err) {
    console.error("Get Health Record Error:", err);
    res.status(500).json({ error: "Failed to fetch health record." });
  }
});

// @route   POST /api/health-records
// @desc    Create a health record
// @access  Authenticated User
router.post("/", protect, async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const data = buildData(req.body);

    const record = await prisma.healthRecord.create({
      data: {
        userId: req.user.id,
        ...data,
      },
    });

    res.status(201).json({ record });
  } catch (err) {
    console.error("Create Health Record Error:", err);
    res.status(500).json({ error: "Failed to create health record." });
  }
});

// @route   PATCH /api/health-records/:id
// @desc    Update a health record
// @access  Authenticated User (own records only)
router.patch("/:id", protect, async (req, res) => {
  try {
    const existing = await prisma.healthRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Health record not found." });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const errors = validate({ ...existing, ...req.body });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const data = buildData(req.body);

    const record = await prisma.healthRecord.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ record });
  } catch (err) {
    console.error("Update Health Record Error:", err);
    res.status(500).json({ error: "Failed to update health record." });
  }
});

// @route   DELETE /api/health-records/:id
// @desc    Delete a health record
// @access  Authenticated User (own records only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const existing = await prisma.healthRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Health record not found." });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    await prisma.healthRecord.delete({ where: { id: req.params.id } });

    res.json({ message: "Health record deleted successfully." });
  } catch (err) {
    console.error("Delete Health Record Error:", err);
    res.status(500).json({ error: "Failed to delete health record." });
  }
});

export default router;
