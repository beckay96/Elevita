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
