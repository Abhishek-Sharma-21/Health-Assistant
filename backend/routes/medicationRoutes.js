import express from "express";
import { prisma } from "../lib/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const VALID_UNITS = ["MG", "G", "ML", "TABLET", "CAPSULE", "DROP", "PUFF", "OTHER"];
const VALID_FREQUENCIES = ["ONCE_DAILY", "TWICE_DAILY", "THREE_TIMES_DAILY", "FOUR_TIMES_DAILY", "WEEKLY", "AS_NEEDED", "CUSTOM"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE"];
const VALID_DOSE_STATUSES = ["PENDING", "TAKEN", "SKIPPED", "MISSED"];

function validateMedication(data) {
  const errors = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 1) {
    errors.push("Medication name is required.");
  }
  if (data.dosage !== undefined && data.dosage !== null && data.dosage !== "") {
    const d = parseFloat(data.dosage);
    if (isNaN(d) || d < 0) {
      errors.push("Dosage must be a positive number.");
    }
  }
  if (data.dosageUnit && !VALID_UNITS.includes(data.dosageUnit)) {
    errors.push(`Dosage unit must be one of: ${VALID_UNITS.join(", ")}`);
  }
  if (data.frequency && !VALID_FREQUENCIES.includes(data.frequency)) {
    errors.push(`Frequency must be one of: ${VALID_FREQUENCIES.join(", ")}`);
  }
  if (!data.startDate) {
    errors.push("Start date is required.");
  } else {
    const d = new Date(data.startDate);
    if (isNaN(d.getTime())) errors.push("Start date must be a valid date.");
  }
  if (data.endDate) {
    const e = new Date(data.endDate);
    if (isNaN(e.getTime())) errors.push("End date must be a valid date.");
    if (data.startDate && new Date(data.startDate) > e) {
      errors.push("End date cannot be before start date.");
    }
  }
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  return errors;
}

function buildMedData(body) {
  const data = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.dosage !== undefined) data.dosage = body.dosage !== "" && body.dosage !== null ? parseFloat(body.dosage) : null;
  if (body.dosageUnit !== undefined) data.dosageUnit = body.dosageUnit || "TABLET";
  if (body.frequency !== undefined) data.frequency = body.frequency || "ONCE_DAILY";
  if (body.instructions !== undefined) data.instructions = body.instructions?.trim() || null;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.status !== undefined) data.status = body.status || "ACTIVE";
  return data;
}

// ─── Medication CRUD ───

// GET /api/medications
router.get("/", protect, async (req, res) => {
  try {
    const status = req.query.status || "";
    const search = (req.query.search || "").trim();

    const where = { userId: req.user.id };
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { instructions: { contains: search, mode: "insensitive" } },
      ];
    }

    const medications = await prisma.medication.findMany({
      where,
      include: {
        schedules: { where: { enabled: true }, orderBy: { time: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ medications });
  } catch (err) {
    console.error("Get Medications Error:", err);
    res.status(500).json({ error: "Failed to fetch medications." });
  }
});

// GET /api/medications/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const med = await prisma.medication.findUnique({
      where: { id: req.params.id },
      include: { schedules: { orderBy: { time: "asc" } } },
    });
    if (!med) return res.status(404).json({ error: "Medication not found." });
    if (med.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });
    res.json({ medication: med });
  } catch (err) {
    console.error("Get Medication Error:", err);
    res.status(500).json({ error: "Failed to fetch medication." });
  }
});

// POST /api/medications
router.post("/", protect, async (req, res) => {
  try {
    const errors = validateMedication(req.body);
    if (errors.length > 0) return res.status(400).json({ error: errors.join(" ") });

    const data = buildMedData(req.body);
    const schedules = req.body.schedules || [];

    const medication = await prisma.medication.create({
      data: {
        userId: req.user.id,
        ...data,
        schedules: {
          create: schedules.map((s) => ({
            time: s.time,
            daysOfWeek: s.daysOfWeek || "daily",
            enabled: s.enabled !== false,
          })),
        },
      },
      include: { schedules: { orderBy: { time: "asc" } } },
    });

    res.status(201).json({ medication });
  } catch (err) {
    console.error("Create Medication Error:", err);
    res.status(500).json({ error: "Failed to create medication." });
  }
});

// PATCH /api/medications/:id
router.patch("/:id", protect, async (req, res) => {
  try {
    const existing = await prisma.medication.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Medication not found." });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    const errors = validateMedication({ ...existing, ...req.body });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(" ") });

    const data = buildMedData(req.body);
    const schedules = req.body.schedules;

    const updateData = { ...data };

    // Replace schedules if provided
    if (Array.isArray(schedules)) {
      await prisma.medicationSchedule.deleteMany({ where: { medicationId: req.params.id } });
      updateData.schedules = {
        create: schedules.map((s) => ({
          time: s.time,
          daysOfWeek: s.daysOfWeek || "daily",
          enabled: s.enabled !== false,
        })),
      };
    }

    const medication = await prisma.medication.update({
      where: { id: req.params.id },
      data: updateData,
      include: { schedules: { orderBy: { time: "asc" } } },
    });

    res.json({ medication });
  } catch (err) {
    console.error("Update Medication Error:", err);
    res.status(500).json({ error: "Failed to update medication." });
  }
});

// DELETE /api/medications/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const existing = await prisma.medication.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Medication not found." });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    await prisma.medication.delete({ where: { id: req.params.id } });
    res.json({ message: "Medication deleted successfully." });
  } catch (err) {
    console.error("Delete Medication Error:", err);
    res.status(500).json({ error: "Failed to delete medication." });
  }
});

// ─── Schedule Management ───

// POST /api/medications/:id/schedules
router.post("/:id/schedules", protect, async (req, res) => {
  try {
    const existing = await prisma.medication.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Medication not found." });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    const { time, daysOfWeek } = req.body;
    if (!time || typeof time !== "string") {
      return res.status(400).json({ error: "Time is required." });
    }

    const schedule = await prisma.medicationSchedule.create({
      data: {
        medicationId: req.params.id,
        time,
        daysOfWeek: daysOfWeek || "daily",
      },
    });

    res.status(201).json({ schedule });
  } catch (err) {
    console.error("Create Schedule Error:", err);
    res.status(500).json({ error: "Failed to create schedule." });
  }
});

// PATCH /api/medications/schedules/:scheduleId
router.patch("/schedules/:scheduleId", protect, async (req, res) => {
  try {
    const schedule = await prisma.medicationSchedule.findUnique({
      where: { id: req.params.scheduleId },
      include: { medication: true },
    });
    if (!schedule) return res.status(404).json({ error: "Schedule not found." });
    if (schedule.medication.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    const data = {};
    if (req.body.time !== undefined) data.time = req.body.time;
    if (req.body.daysOfWeek !== undefined) data.daysOfWeek = req.body.daysOfWeek;
    if (req.body.enabled !== undefined) data.enabled = req.body.enabled;

    const updated = await prisma.medicationSchedule.update({
      where: { id: req.params.scheduleId },
      data,
    });

    res.json({ schedule: updated });
  } catch (err) {
    console.error("Update Schedule Error:", err);
    res.status(500).json({ error: "Failed to update schedule." });
  }
});

// DELETE /api/medications/schedules/:scheduleId
router.delete("/schedules/:scheduleId", protect, async (req, res) => {
  try {
    const schedule = await prisma.medicationSchedule.findUnique({
      where: { id: req.params.scheduleId },
      include: { medication: true },
    });
    if (!schedule) return res.status(404).json({ error: "Schedule not found." });
    if (schedule.medication.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    await prisma.medicationSchedule.delete({ where: { id: req.params.scheduleId } });
    res.json({ message: "Schedule deleted." });
  } catch (err) {
    console.error("Delete Schedule Error:", err);
    res.status(500).json({ error: "Failed to delete schedule." });
  }
});

// ─── Dose Tracking ───

// GET /api/medications/doses/upcoming
router.get("/doses/upcoming", protect, async (req, res) => {
  try {
    const now = new Date();
    const doses = await prisma.medicationDose.findMany({
      where: {
        medication: { userId: req.user.id, status: "ACTIVE" },
        status: "PENDING",
        scheduledAt: { gte: now },
      },
      include: { medication: { select: { id: true, name: true, dosage: true, dosageUnit: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });
    res.json({ doses });
  } catch (err) {
    console.error("Get Upcoming Doses Error:", err);
    res.status(500).json({ error: "Failed to fetch upcoming doses." });
  }
});

// GET /api/medications/doses/today
router.get("/doses/today", protect, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const doses = await prisma.medicationDose.findMany({
      where: {
        medication: { userId: req.user.id },
        scheduledAt: { gte: start, lte: end },
      },
      include: { medication: { select: { id: true, name: true, dosage: true, dosageUnit: true } } },
      orderBy: { scheduledAt: "asc" },
    });
    res.json({ doses });
  } catch (err) {
    console.error("Get Today Doses Error:", err);
    res.status(500).json({ error: "Failed to fetch today's doses." });
  }
});

// POST /api/medications/doses/generate
router.post("/doses/generate", protect, async (req, res) => {
  try {
    const { medicationId, startDate, endDate } = req.body;
    if (!medicationId) return res.status(400).json({ error: "Medication ID is required." });

    const med = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: { schedules: { where: { enabled: true } } },
    });
    if (!med) return res.status(404).json({ error: "Medication not found." });
    if (med.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    const from = startDate ? new Date(startDate) : new Date();
    const to = endDate ? new Date(endDate) : new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);

    const dosesToCreate = [];
    for (const schedule of med.schedules) {
      const [hours, minutes] = schedule.time.split(":").map(Number);
      const current = new Date(from);
      while (current <= to) {
        const doseTime = new Date(current);
        doseTime.setHours(hours, minutes, 0, 0);

        if (doseTime >= new Date()) {
          dosesToCreate.push({
            medicationId: med.id,
            scheduledAt: doseTime,
            status: "PENDING",
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    if (dosesToCreate.length > 0) {
      await prisma.medicationDose.createMany({ data: dosesToCreate, skipDuplicates: true });
    }

    res.json({ message: `${dosesToCreate.length} doses generated.`, count: dosesToCreate.length });
  } catch (err) {
    console.error("Generate Doses Error:", err);
    res.status(500).json({ error: "Failed to generate doses." });
  }
});

// PATCH /api/medications/doses/:doseId
router.patch("/doses/:doseId", protect, async (req, res) => {
  try {
    const dose = await prisma.medicationDose.findUnique({
      where: { id: req.params.doseId },
      include: { medication: true },
    });
    if (!dose) return res.status(404).json({ error: "Dose not found." });
    if (dose.medication.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    const { status } = req.body;
    if (!status || !VALID_DOSE_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_DOSE_STATUSES.join(", ")}` });
    }

    const updateData = { status };
    if (status === "TAKEN") updateData.takenAt = new Date();

    const updated = await prisma.medicationDose.update({
      where: { id: req.params.doseId },
      data: updateData,
      include: { medication: { select: { id: true, name: true, dosage: true, dosageUnit: true } } },
    });

    res.json({ dose: updated });
  } catch (err) {
    console.error("Update Dose Error:", err);
    res.status(500).json({ error: "Failed to update dose." });
  }
});

// DELETE /api/medications/doses/:doseId
router.delete("/doses/:doseId", protect, async (req, res) => {
  try {
    const dose = await prisma.medicationDose.findUnique({
      where: { id: req.params.doseId },
      include: { medication: true },
    });
    if (!dose) return res.status(404).json({ error: "Dose not found." });
    if (dose.medication.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    await prisma.medicationDose.delete({ where: { id: req.params.doseId } });
    res.json({ message: "Dose deleted." });
  } catch (err) {
    console.error("Delete Dose Error:", err);
    res.status(500).json({ error: "Failed to delete dose." });
  }
});

export default router;
