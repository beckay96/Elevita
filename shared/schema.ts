import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // User role and professional fields
  userRole: varchar("user_role").default("patient"), // patient, doctor, nurse, clinician
  isHealthcareProfessional: boolean("is_healthcare_professional").default(false),
  licenseNumber: varchar("license_number"),
  specialty: varchar("specialty"),
  institution: varchar("institution"),
  yearsExperience: integer("years_experience"),
  // Setup completion status
  setupCompleted: boolean("setup_completed").default(false),
  setupStep: integer("setup_step").default(0), // 0 = not started, 1 = role selection, 2 = profile, 3 = complete
  currentView: varchar("current_view").default("patient"), // patient or professional
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health Profile table - stores user health preferences and settings
export const healthProfiles = pgTable("health_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  allergies: text("allergies").array(),
  chronicConditions: text("chronic_conditions").array(),
  preferredPharmacy: varchar("preferred_pharmacy"),
  insuranceProvider: varchar("insurance_provider"),
  primaryCareProvider: varchar("primary_care_provider"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medications table - tracks current and past medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  dosage: varchar("dosage").notNull(),
  frequency: varchar("frequency").notNull(), // e.g., "twice daily", "once weekly"
  instructions: text("instructions"),
  prescribedBy: varchar("prescribed_by"),
  purpose: text("purpose"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null for ongoing medications
  isActive: boolean("is_active").default(true),
  sideEffects: text("side_effects").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medication Logs table - tracks when medications are taken
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  medicationId: integer("medication_id").notNull().references(() => medications.id, { onDelete: "cascade" }),
  takenAt: timestamp("taken_at").notNull(),
  dosageTaken: varchar("dosage_taken"),
  notes: text("notes"),
  missed: boolean("missed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Symptoms table - tracks symptom occurrences
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
  location: varchar("location"),
  duration: varchar("duration"),
  triggers: text("triggers").array(),
  notes: text("notes"),
  occurredAt: timestamp("occurred_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments table - tracks medical appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  provider: varchar("provider").notNull(),
  type: varchar("type"), // e.g., "checkup", "specialist", "follow-up"
  location: varchar("location"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled
  outcome: text("outcome"), // post-appointment notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health Metrics table - tracks various health measurements
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // blood_pressure, weight, glucose, etc.
  value: varchar("value").notNull(), // stores value as string to accommodate different formats
  unit: varchar("unit"),
  measuredAt: timestamp("measured_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Insights table - stores AI-generated health insights
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // pattern, observation, recommendation
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  confidence: integer("confidence"), // 1-100
  dataPoints: jsonb("data_points"), // references to related data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reminders table - medication and appointment reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // medication, appointment, health_check
  title: varchar("title").notNull(),
  description: text("description"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  isCompleted: boolean("is_completed").default(false),
  reminderTime: time("reminder_time"),
  relatedId: integer("related_id"), // references medication_id, appointment_id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Reports table - for provider handover summaries
export const healthReports = pgTable("health_reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  content: jsonb("content").notNull(), // structured report data
  generatedAt: timestamp("generated_at").defaultNow(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  reportType: varchar("report_type").notNull(), // summary, provider_handover, export
  fileUrl: varchar("file_url"), // PDF download link
});

// Transcriptions table for Elevita's Ears - TGA Compliant Speech-to-Text
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Doctor/clinician who made the recording
  patientId: varchar("patient_id").references(() => users.id, { onDelete: "cascade" }), // Patient the recording is about
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" }), // Related appointment
  title: varchar("title").notNull(),
  description: text("description"),
  transcript: text("transcript").notNull(),
  duration: integer("duration").notNull(), // Duration in seconds
  audioFileUrl: varchar("audio_file_url"), // URL to stored audio file
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // medication_reminder, appointment_reminder, health_alert, ai_insight, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isActionable: boolean("is_actionable").default(false), // Can user take action on this notification
  actionUrl: varchar("action_url"), // URL to navigate when notification is clicked
  scheduledFor: timestamp("scheduled_for"), // For future notifications
  metadata: jsonb("metadata"), // Additional data like medication_id, appointment_id, etc.
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Notification settings table
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  medicationReminders: boolean("medication_reminders").default(true),
  appointmentReminders: boolean("appointment_reminders").default(true),
  healthAlerts: boolean("health_alerts").default(true),
  aiInsights: boolean("ai_insights").default(true),
  weeklyReports: boolean("weekly_reports").default(false),
  emergencyAlerts: boolean("emergency_alerts").default(true),
  reminderTime: varchar("reminder_time").default("09:00"), // Default reminder time
  reminderFrequency: varchar("reminder_frequency").default("daily"), // daily, weekly, custom
  emailNotifications: boolean("email_notifications").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for frontend use
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertHealthProfile = typeof healthProfiles.$inferInsert;
export type HealthProfile = typeof healthProfiles.$inferSelect;

export type InsertMedication = typeof medications.$inferInsert;
export type Medication = typeof medications.$inferSelect;

export type InsertMedicationLog = typeof medicationLogs.$inferInsert;
export type MedicationLog = typeof medicationLogs.$inferSelect;

export type InsertSymptom = typeof symptoms.$inferInsert;
export type Symptom = typeof symptoms.$inferSelect;

export type InsertAppointment = typeof appointments.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;

export type InsertHealthMetric = typeof healthMetrics.$inferInsert;
export type HealthMetric = typeof healthMetrics.$inferSelect;

export type InsertAiInsight = typeof aiInsights.$inferInsert;
export type AiInsight = typeof aiInsights.$inferSelect;

export type InsertReminder = typeof reminders.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;

export type InsertHealthReport = typeof healthReports.$inferInsert;
export type HealthReport = typeof healthReports.$inferSelect;

export type InsertTranscription = typeof transcriptions.$inferInsert;
export type Transcription = typeof transcriptions.$inferSelect;

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

// Validation schemas
export const insertHealthProfileSchema = createInsertSchema(healthProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

// User setup wizard schemas
export const userRoleSelectionSchema = z.object({
  userRole: z.enum(["patient", "doctor", "nurse", "clinician"]),
  isHealthcareProfessional: z.boolean().default(false),
});

export const professionalInfoSchema = z.object({
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  institution: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
});

export const basicProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type UserRoleSelection = z.infer<typeof userRoleSelectionSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type BasicProfile = z.infer<typeof basicProfileSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  healthProfiles: many(healthProfiles),
  medications: many(medications),
  medicationLogs: many(medicationLogs),
  symptoms: many(symptoms),
  appointments: many(appointments),
  healthMetrics: many(healthMetrics),
  aiInsights: many(aiInsights),
  reminders: many(reminders),
  healthReports: many(healthReports),
  transcriptions: many(transcriptions),
  patientTranscriptions: many(transcriptions, { relationName: "PatientTranscriptions" }),
}));

export const healthProfilesRelations = relations(healthProfiles, ({ one }) => ({
  user: one(users, {
    fields: [healthProfiles.userId],
    references: [users.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  medicationLogs: many(medicationLogs),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  user: one(users, {
    fields: [medicationLogs.userId],
    references: [users.id],
  }),
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
}));

export const symptomsRelations = relations(symptoms, ({ one }) => ({
  user: one(users, {
    fields: [symptoms.userId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  transcriptions: many(transcriptions),
}));

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  user: one(users, {
    fields: [transcriptions.userId],
    references: [users.id],
  }),
  patient: one(users, {
    fields: [transcriptions.patientId],
    references: [users.id],
    relationName: "PatientTranscriptions",
  }),
  appointment: one(appointments, {
    fields: [transcriptions.appointmentId],
    references: [appointments.id],
  }),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  user: one(users, {
    fields: [aiInsights.userId],
    references: [users.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));

export const healthReportsRelations = relations(healthReports, ({ one }) => ({
  user: one(users, {
    fields: [healthReports.userId],
    references: [users.id],
  }),
}));
