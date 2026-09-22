import { prisma } from "../lib/db.js";

const RECORD_LIMIT = 10;

export async function getProfile(userId) {
  const profile = await prisma.healthProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  return {
    fullName: profile.fullName || undefined,
    gender: profile.gender || undefined,
    dateOfBirth: profile.dateOfBirth || undefined,
    bloodGroup: profile.bloodGroup || undefined,
    heightCm: profile.heightCm || undefined,
    weightKg: profile.weightKg || undefined,
    smokingStatus: profile.smokingStatus || undefined,
    alcoholStatus: profile.alcoholStatus || undefined,
    activityLevel: profile.activityLevel || undefined,
    allergies: profile.allergies || undefined,
    chronicConditions: profile.chronicConditions || undefined,
    currentMedications: profile.currentMedications || undefined,
    surgicalHistory: profile.surgicalHistory || undefined,
    familyHistory: profile.familyHistory || undefined,
    emergencyContactName: profile.emergencyContactName || undefined,
    emergencyContactPhone: profile.emergencyContactPhone || undefined,
  };
}

export async function getRecentRecords(userId) {
  const records = await prisma.healthRecord.findMany({
    where: { userId },
    orderBy: { recordDate: "desc" },
    take: RECORD_LIMIT,
    select: {
      id: true,
      recordType: true,
      title: true,
      description: true,
      recordDate: true,
      hospitalName: true,
      doctorName: true,
      notes: true,
      attachments: true,
    },
  });
  return records.map((r) => ({
    ...r,
    recordDate: r.recordDate?.toISOString(),
  }));
}

export async function getActiveMedications(userId) {
  const medications = await prisma.medication.findMany({
    where: { userId, isActive: true },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      dosage: true,
      frequency: true,
      route: true,
      purpose: true,
      startDate: true,
      endDate: true,
      notes: true,
    },
  });
  return medications.map((m) => ({
    ...m,
    startDate: m.startDate?.toISOString(),
    endDate: m.endDate?.toISOString() || null,
  }));
}

export async function getMedicationActivity(userId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const doses = await prisma.medicationDose.findMany({
    where: {
      schedule: { medication: { userId } },
      scheduledAt: { gte: thirtyDaysAgo },
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
    include: {
      schedule: {
        include: {
          medication: { select: { id: true, name: true, dosage: true } },
        },
      },
    },
  });

  return doses.map((d) => ({
    id: d.id,
    medicationName: d.schedule.medication.name,
    medicationDosage: d.schedule.medication.dosage,
    scheduledAt: d.scheduledAt?.toISOString(),
    status: d.status,
  }));
}

export async function getMeasurements(userId) {
  const profile = await prisma.healthProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const measurements = {};
  if (profile.heightCm) measurements.heightCm = profile.heightCm;
  if (profile.weightKg) measurements.weightKg = profile.weightKg;
  if (profile.heightCm && profile.weightKg) {
    const heightM = profile.heightCm / 100;
    measurements.bmi = +(profile.weightKg / (heightM * heightM)).toFixed(1);
  }
  if (Object.keys(measurements).length === 0) return null;
  return measurements;
}

export async function getTrends(userId) {
  const profile = await prisma.healthProfile.findUnique({ where: { userId } });
  const records = await prisma.healthRecord.findMany({
    where: { userId },
    orderBy: { recordDate: "desc" },
    take: RECORD_LIMIT,
    select: { recordType: true, recordDate: true },
  });

  const recordTypeCounts = {};
  records.forEach((r) => {
    recordTypeCounts[r.recordType] = (recordTypeCounts[r.recordType] || 0) + 1;
  });

  const trends = { recordTypeSummary: recordTypeCounts };
  if (profile?.weightKg) trends.latestWeightKg = profile.weightKg;
  if (profile?.heightCm) trends.latestHeightCm = profile.heightCm;
  return trends;
}

export async function buildSafeContext(userId, categories) {
  const context = {};
  const fetches = [];

  if (categories.has("PROFILE")) {
    fetches.push(
      getProfile(userId).then((p) => {
        if (p) context.profile = p;
      })
    );
  }
  if (categories.has("RECORDS")) {
    fetches.push(
      getRecentRecords(userId).then((r) => {
        if (r.length > 0) context.recentRecords = r;
      })
    );
  }
  if (categories.has("MEDICATIONS")) {
    fetches.push(
      getActiveMedications(userId).then((m) => {
        if (m.length > 0) context.activeMedications = m;
      })
    );
    fetches.push(
      getMedicationActivity(userId).then((a) => {
        if (a.length > 0) context.medicationActivity = a;
      })
    );
  }
  if (categories.has("MEASUREMENTS")) {
    fetches.push(
      getMeasurements(userId).then((m) => {
        if (m) context.measurements = m;
      })
    );
  }
  if (categories.has("TRENDS")) {
    fetches.push(
      getTrends(userId).then((t) => {
        if (t) context.trends = t;
      })
    );
  }

  await Promise.all(fetches);
  return context;
}
