import express from "express";
import { prisma } from "../lib/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const PROFILE_FIELDS = [
  "dateOfBirth", "gender", "height", "weight", "bloodGroup",
  "allergies", "medicalConditions", "currentMedications",
  "smokingStatus", "alcoholStatus", "activityLevel",
];

function calcProfileCompletion(profile) {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== "" && v !== "UNKNOWN";
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

// @route   GET /api/dashboard
// @desc    Get authenticated user's dashboard overview
// @access  Authenticated User
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      profile,
      totalRecords,
      recentRecords,
      activeMedications,
      todayDoses,
      completedTodayDoses,
    ] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.healthRecord.count({ where: { userId } }),
      prisma.healthRecord.findMany({
        where: { userId },
        orderBy: { recordDate: "desc" },
        take: 5,
        select: {
          id: true,
          recordType: true,
          title: true,
          recordDate: true,
          doctorName: true,
          hospitalName: true,
        },
      }),
      prisma.medication.count({
        where: { userId, status: "ACTIVE" },
      }),
      prisma.medicationDose.findMany({
        where: {
          medication: { userId, status: "ACTIVE" },
          scheduledAt: { gte: today, lte: todayEnd },
        },
        include: {
          medication: {
            select: { id: true, name: true, dosage: true, dosageUnit: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.medicationDose.findMany({
        where: {
          medication: { userId, status: "ACTIVE" },
          scheduledAt: { gte: today, lte: todayEnd },
          status: "TAKEN",
        },
        select: { id: true },
      }),
    ]);

    const profileCompletion = calcProfileCompletion(profile);

    const profileSummary = profile
      ? {
          bloodGroup: profile.bloodGroup,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
          activityLevel: profile.activityLevel,
        }
      : null;

    res.json({
      profile: {
        completion: profileCompletion,
        summary: profileSummary,
      },
      records: {
        total: totalRecords,
        recent: recentRecords,
      },
      medications: {
        active: activeMedications,
      },
      reminders: {
        today: todayDoses.length,
        completed: completedTodayDoses.length,
        doses: todayDoses.map((d) => ({
          id: d.id,
          scheduledAt: d.scheduledAt,
          status: d.status,
          medication: d.medication,
        })),
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load dashboard." });
  }
});

export default router;
