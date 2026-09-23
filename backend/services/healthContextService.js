// ─── Health Context Service ────────────────────────────────────────────────
// Low-level, user-scoped loaders for health data slices.
// AI features must call resolveHealthContext in healthContextContract.js
// rather than assembling context here or in routes.
// ────────────────────────────────────────────────────────────────────────────

import { prisma } from "../lib/db.js";
import {
  PROFILE_CONTEXT_FIELDS,
  RECORD_CONTEXT_FIELDS,
  MEDICATION_CONTEXT_FIELDS,
} from "./healthDataModel.js";

const RECORD_LIMIT = 10;

export async function getProfile(userId) {
  const profile = await prisma.healthProfile.findUnique({
    where: { userId },
    select: PROFILE_CONTEXT_FIELDS,
  });
  if (!profile) return null;
  return {
    gender: profile.gender || undefined,
    dateOfBirth: profile.dateOfBirth || undefined,
    bloodGroup: profile.bloodGroup || undefined,
    height: profile.height ?? undefined,
    weight: profile.weight ?? undefined,
    smokingStatus: profile.smokingStatus || undefined,
    alcoholStatus: profile.alcoholStatus || undefined,
    activityLevel: profile.activityLevel || undefined,
    allergies: profile.allergies || undefined,
    medicalConditions: profile.medicalConditions || undefined,
    currentMedications: profile.currentMedications || undefined,
  };
}

export async function getRecentRecords(userId) {
  const records = await prisma.healthRecord.findMany({
    where: { userId },
    orderBy: { recordDate: "desc" },
    take: RECORD_LIMIT,
    select: RECORD_CONTEXT_FIELDS,
  });
  return records.map((r) => ({
    ...r,
    recordDate: r.recordDate?.toISOString(),
  }));
}

export async function getActiveMedications(userId) {
  const medications = await prisma.medication.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { startDate: "desc" },
    select: MEDICATION_CONTEXT_FIELDS,
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
      medication: { userId },
      scheduledAt: { gte: thirtyDaysAgo },
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
    include: {
      medication: { select: { id: true, name: true, dosage: true } },
    },
  });

  return doses.map((d) => ({
    id: d.id,
    medicationName: d.medication.name,
    medicationDosage: d.medication.dosage,
    scheduledAt: d.scheduledAt?.toISOString(),
    status: d.status,
  }));
}

export async function getMeasurements(userId) {
  const profile = await prisma.healthProfile.findUnique({
    where: { userId },
    select: { height: true, weight: true },
  });
  if (!profile) return null;

  const measurements = {};
  if (profile.height) measurements.height = profile.height;
  if (profile.weight) measurements.weight = profile.weight;
  if (profile.height && profile.weight) {
    const heightM = profile.height / 100;
    if (heightM > 0) {
      measurements.bmi = +(profile.weight / (heightM * heightM)).toFixed(1);
    }
  }
  if (Object.keys(measurements).length === 0) return null;
  return measurements;
}

export async function getTrends(userId) {
  const profile = await prisma.healthProfile.findUnique({
    where: { userId },
    select: { height: true, weight: true },
  });
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
  if (profile?.weight) trends.latestWeight = profile.weight;
  if (profile?.height) trends.latestHeight = profile.height;
  return trends;
}

/**
 * Legacy helper: build health sections only (no conversation).
 * Prefer resolveHealthContext from healthContextContract.js for AI features.
 * Still user-scoped only.
 */
export async function buildSafeContext(userId, categories) {
  const wanted = categories instanceof Set ? categories : new Set(categories || []);
  const context = {};
  const fetches = [];

  if (wanted.has("PROFILE")) {
    fetches.push(getProfile(userId).then((p) => { if (p) context.profile = p; }));
  }
  if (wanted.has("RECORDS")) {
    fetches.push(getRecentRecords(userId).then((r) => { if (r.length) context.recentRecords = r; }));
  }
  if (wanted.has("MEDICATIONS")) {
    fetches.push(getActiveMedications(userId).then((m) => { if (m.length) context.activeMedications = m; }));
    fetches.push(getMedicationActivity(userId).then((a) => { if (a.length) context.medicationActivity = a; }));
  }
  if (wanted.has("MEASUREMENTS")) {
    fetches.push(getMeasurements(userId).then((m) => { if (m) context.measurements = m; }));
  }
  if (wanted.has("TRENDS")) {
    fetches.push(getTrends(userId).then((t) => { if (t) context.trends = t; }));
  }

  await Promise.all(fetches);
  return context;
}
