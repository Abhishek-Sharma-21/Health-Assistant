// ─── Health Data Model ─────────────────────────────────────────────────────
// Canonical representation of health entities available to the application
// and AI layer. Derived from prisma/schema.prisma — do not invent fields.
// No new database entities: Measurements and Trends are derived views.
// ────────────────────────────────────────────────────────────────────────────

export const HEALTH_ENTITIES = {
  Profile: {
    source: "HealthProfile",
    ownership: "userId (unique) → User",
    id: "id",
    userOwnership: "userId",
    required: [],
    optional: [
      "dateOfBirth", "gender", "height", "weight", "bloodGroup",
      "allergies", "medicalConditions", "currentMedications",
      "smokingStatus", "alcoholStatus", "activityLevel",
    ],
    timestamps: ["createdAt", "updatedAt"],
    relationships: ["User (1:1)"],
    notes: "height/weight are Float cm/kg; BMI derived at read time.",
  },

  HealthRecords: {
    source: "HealthRecord",
    ownership: "userId → User",
    id: "id",
    userOwnership: "userId",
    required: ["recordType", "title", "recordDate"],
    optional: ["doctorName", "hospitalName", "diagnosis", "description", "notes"],
    timestamps: ["createdAt", "updatedAt"],
    relationships: ["User (N:1)"],
  },

  Medications: {
    source: "Medication",
    ownership: "userId → User",
    id: "id",
    userOwnership: "userId",
    required: ["name", "startDate"],
    optional: ["dosage", "dosageUnit", "frequency", "instructions", "endDate", "status"],
    timestamps: ["createdAt", "updatedAt"],
    relationships: ["User (N:1)", "MedicationSchedule (1:N)", "MedicationDose (1:N)"],
  },

  Measurements: {
    source: "HealthProfile (derived)",
    ownership: "userId via Profile",
    id: null,
    userOwnership: "userId",
    required: [],
    optional: ["height", "weight", "bmi"],
    timestamps: [],
    relationships: ["Profile"],
    notes: "No separate Measurement table. BMI = weight / (height_m)^2 when both present.",
  },

  Trends: {
    source: "derived aggregates",
    ownership: "userId",
    id: null,
    userOwnership: "userId",
    required: [],
    optional: ["recordTypeSummary", "latestWeight", "latestHeight"],
    timestamps: [],
    relationships: ["HealthRecords", "Profile"],
    notes: "Computed from recent records + profile; not stored.",
  },

  Conversations: {
    source: "Conversation",
    ownership: "userId → User",
    id: "id",
    userOwnership: "userId",
    required: ["title"],
    optional: [],
    timestamps: ["createdAt", "updatedAt"],
    relationships: ["User (N:1)", "ConversationMessage (1:N)"],
  },

  Messages: {
    source: "ConversationMessage",
    ownership: "via Conversation.userId",
    id: "id",
    userOwnership: "conversation.userId",
    required: ["role", "content"],
    optional: ["contextUsed"],
    timestamps: ["createdAt"],
    relationships: ["Conversation (N:1, cascade delete)"],
  },

  AIPreference: {
    source: "AIPreference",
    ownership: "userId (unique) → User",
    id: "id",
    userOwnership: "userId",
    required: [],
    optional: [
      "preferredLanguage", "responseStyle", "preferredUnit", "memoryEnabled",
    ],
    timestamps: ["createdAt", "updatedAt"],
    relationships: ["User (1:1)"],
    notes: "memoryEnabled is the master health-context toggle.",
  },
};

// Field selections used when loading AI-ready slices (keep in sync with schema)
export const PROFILE_CONTEXT_FIELDS = {
  gender: true,
  dateOfBirth: true,
  bloodGroup: true,
  height: true,
  weight: true,
  smokingStatus: true,
  alcoholStatus: true,
  activityLevel: true,
  allergies: true,
  medicalConditions: true,
  currentMedications: true,
};

export const RECORD_CONTEXT_FIELDS = {
  id: true,
  recordType: true,
  title: true,
  description: true,
  recordDate: true,
  hospitalName: true,
  doctorName: true,
  notes: true,
};

export const MEDICATION_CONTEXT_FIELDS = {
  id: true,
  name: true,
  dosage: true,
  dosageUnit: true,
  frequency: true,
  instructions: true,
  startDate: true,
  endDate: true,
  status: true,
};
