import express from "express";
import { prisma } from "../lib/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const VALID_GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
const VALID_BLOOD_GROUPS = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"];
const VALID_SMOKING = ["NEVER", "FORMER", "CURRENT", "UNKNOWN"];
const VALID_ALCOHOL = ["NEVER", "FORMER", "CURRENT", "UNKNOWN"];
const VALID_ACTIVITY = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE", "UNKNOWN"];

function validate(data) {
  const errors = [];

  if (data.dateOfBirth !== undefined && data.dateOfBirth !== null) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push("Date of birth must be a valid date.");
    } else if (dob > new Date()) {
      errors.push("Date of birth cannot be in the future.");
    }
  }

  if (data.height !== undefined && data.height !== null) {
    if (typeof data.height !== "number" || data.height < 0 || data.height > 300) {
      errors.push("Height must be a reasonable value between 0 and 300 cm.");
    }
  }

  if (data.weight !== undefined && data.weight !== null) {
    if (typeof data.weight !== "number" || data.weight < 0 || data.weight > 500) {
      errors.push("Weight must be a reasonable value between 0 and 500 kg.");
    }
  }

  if (data.gender !== undefined && data.gender !== null && data.gender !== "") {
    if (!VALID_GENDERS.includes(data.gender)) {
      errors.push(`Gender must be one of: ${VALID_GENDERS.join(", ")}`);
    }
  }

  if (data.bloodGroup !== undefined && data.bloodGroup !== null && data.bloodGroup !== "") {
    if (!VALID_BLOOD_GROUPS.includes(data.bloodGroup)) {
      errors.push(`Blood group must be one of: ${VALID_BLOOD_GROUPS.join(", ")}`);
    }
  }

  if (data.smokingStatus !== undefined && !VALID_SMOKING.includes(data.smokingStatus)) {
    errors.push(`Smoking status must be one of: ${VALID_SMOKING.join(", ")}`);
  }

  if (data.alcoholStatus !== undefined && !VALID_ALCOHOL.includes(data.alcoholStatus)) {
    errors.push(`Alcohol status must be one of: ${VALID_ALCOHOL.join(", ")}`);
  }

  if (data.activityLevel !== undefined && !VALID_ACTIVITY.includes(data.activityLevel)) {
    errors.push(`Activity level must be one of: ${VALID_ACTIVITY.join(", ")}`);
  }

  if (data.allergies !== undefined && data.allergies !== null && typeof data.allergies !== "string") {
    errors.push("Allergies must be text.");
  }

  if (data.medicalConditions !== undefined && data.medicalConditions !== null && typeof data.medicalConditions !== "string") {
    errors.push("Medical conditions must be text.");
  }

  if (data.currentMedications !== undefined && data.currentMedications !== null && typeof data.currentMedications !== "string") {
    errors.push("Current medications must be text.");
  }

  return errors;
}

function buildUpdateData(body) {
  const data = {};

  if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
  if (body.gender !== undefined) data.gender = body.gender || null;
  if (body.height !== undefined) data.height = body.height ?? null;
  if (body.weight !== undefined) data.weight = body.weight ?? null;
  if (body.bloodGroup !== undefined) data.bloodGroup = body.bloodGroup || null;
  if (body.allergies !== undefined) data.allergies = body.allergies?.trim() || null;
  if (body.medicalConditions !== undefined) data.medicalConditions = body.medicalConditions?.trim() || null;
  if (body.currentMedications !== undefined) data.currentMedications = body.currentMedications?.trim() || null;
  if (body.smokingStatus !== undefined) data.smokingStatus = body.smokingStatus || "UNKNOWN";
  if (body.alcoholStatus !== undefined) data.alcoholStatus = body.alcoholStatus || "UNKNOWN";
  if (body.activityLevel !== undefined) data.activityLevel = body.activityLevel || "UNKNOWN";

  return data;
}

// @route   GET /api/profile
// @desc    Get authenticated user's health profile
// @access  Authenticated User
router.get("/", protect, async (req, res) => {
  try {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ profile });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ error: "Failed to fetch health profile." });
  }
});

// @route   POST /api/profile
// @desc    Create authenticated user's health profile
// @access  Authenticated User
router.post("/", protect, async (req, res) => {
  try {
    const existing = await prisma.healthProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(409).json({ error: "Health profile already exists. Use PATCH to update." });
    }

    const errors = validate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const data = buildUpdateData(req.body);

    const profile = await prisma.healthProfile.create({
      data: {
        userId: req.user.id,
        ...data,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ profile });
  } catch (err) {
    console.error("Create Profile Error:", err);
    res.status(500).json({ error: "Failed to create health profile." });
  }
});

// @route   PATCH /api/profile
// @desc    Update authenticated user's health profile
// @access  Authenticated User
router.patch("/", protect, async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const existing = await prisma.healthProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Health profile not found. Create one first with POST." });
    }

    const data = buildUpdateData(req.body);

    const profile = await prisma.healthProfile.update({
      where: { userId: req.user.id },
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ profile });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Failed to update health profile." });
  }
});

export default router;
