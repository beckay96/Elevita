import {
  users,
  healthProfiles,
  medications,
  medicationLogs,
  symptoms,
  appointments,
  healthMetrics,
  aiInsights,
  reminders,
  healthReports,
  transcriptions,
  notifications,
  notificationSettings,
  type User,
  type UpsertUser,
  type HealthProfile,
  type InsertHealthProfile,
  type Medication,
  type InsertMedication,
  type MedicationLog,
  type InsertMedicationLog,
  type Symptom,
  type InsertSymptom,
  type Appointment,
  type InsertAppointment,
  type HealthMetric,
  type InsertHealthMetric,
  type AiInsight,
  type InsertAiInsight,
  type Reminder,
  type InsertReminder,
  type HealthReport,
  type InsertHealthReport,
  type Transcription,
  type InsertTranscription,
  type Notification,
  type InsertNotification,
  type NotificationSettings,
  type InsertNotificationSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, lt, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User setup operations
  updateUserSetup(userId: string, updates: Partial<UpsertUser>): Promise<User>;
  completeUserSetup(userId: string): Promise<User>;
  
  // Health Profile operations
  getHealthProfile(userId: string): Promise<HealthProfile | undefined>;
  createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile>;
  updateHealthProfile(userId: string, profile: Partial<InsertHealthProfile>): Promise<HealthProfile>;
  
  // Medication operations
  getMedications(userId: string): Promise<Medication[]>;
  getActiveMedications(userId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;
  
  // Medication Log operations
  getMedicationLogs(userId: string, medicationId?: number): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationAdherence(userId: string, medicationId: number, days: number): Promise<number>;
  
  // Symptom operations
  getSymptoms(userId: string): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(id: number, symptom: Partial<InsertSymptom>): Promise<Symptom>;
  deleteSymptom(id: number): Promise<void>;
  
  // Appointment operations
  getAppointments(userId: string): Promise<Appointment[]>;
  getUpcomingAppointments(userId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  
  // Health Metrics operations
  getHealthMetrics(userId: string, type?: string): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // AI Insights operations
  getAiInsights(userId: string): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markInsightAsRead(id: number): Promise<void>;
  
  // Reminder operations
  getReminders(userId: string): Promise<Reminder[]>;
  getTodayReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  markReminderCompleted(id: number): Promise<void>;
  
  // Health Report operations
  getHealthReports(userId: string): Promise<HealthReport[]>;
  createHealthReport(report: InsertHealthReport): Promise<HealthReport>;

  // Transcription operations (Elevita's Ears)
  getTranscriptions(userId: string): Promise<Transcription[]>;
  getTranscription(id: number): Promise<Transcription | undefined>;
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  updateTranscription(id: number, updates: Partial<InsertTranscription>): Promise<Transcription>;
  deleteTranscription(id: number): Promise<void>;

  // Notification operations
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Notification settings operations
  getNotificationSettings(userId: string): Promise<NotificationSettings | undefined>;
  upsertNotificationSettings(userId: string, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
  
  // Notification triggering
  scheduleNotification(notification: InsertNotification): Promise<Notification>;
  processScheduledNotifications(): Promise<void>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    daysTracking: number;
    medicationsActive: number;
    upcomingAppointments: number;
  }>;
  
  // Timeline data
  getTimelineEvents(userId: string, limit?: number): Promise<Array<{
    id: number;
    type: 'symptom' | 'medication' | 'appointment' | 'metric';
    title: string;
    description: string;
    date: Date;
    severity?: number;
    tags: string[];
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User setup operations
  async updateUserSetup(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  }

  async completeUserSetup(userId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ 
        setupCompleted: true, 
        setupStep: 3,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  }

  // Health Profile operations
  async getHealthProfile(userId: string): Promise<HealthProfile | undefined> {
    const [profile] = await db.select().from(healthProfiles).where(eq(healthProfiles.userId, userId));
    return profile || undefined;
  }

  async createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile> {
    const [newProfile] = await db
      .insert(healthProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateHealthProfile(userId: string, profile: Partial<InsertHealthProfile>): Promise<HealthProfile> {
    const [updated] = await db
      .update(healthProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(healthProfiles.userId, userId))
      .returning();
    if (!updated) {
      throw new Error("Health profile not found");
    }
    return updated;
  }

  // Medication operations
  async getMedications(userId: string): Promise<Medication[]> {
    return await db.select().from(medications).where(eq(medications.userId, userId));
  }

  async getActiveMedications(userId: string): Promise<Medication[]> {
    return await db.select().from(medications).where(
      and(eq(medications.userId, userId), eq(medications.isActive, true))
    );
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication> {
    const [updated] = await db
      .update(medications)
      .set({ ...medication, updatedAt: new Date() })
      .where(eq(medications.id, id))
      .returning();
    if (!updated) {
      throw new Error("Medication not found");
    }
    return updated;
  }

  async deleteMedication(id: number): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id));
  }

  // Medication Log operations
  async getMedicationLogs(userId: string, medicationId?: number): Promise<MedicationLog[]> {
    if (medicationId) {
      return await db.select().from(medicationLogs).where(
        and(eq(medicationLogs.userId, userId), eq(medicationLogs.medicationId, medicationId))
      );
    }
    return await db.select().from(medicationLogs).where(eq(medicationLogs.userId, userId));
  }

  async createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
    const [newLog] = await db
      .insert(medicationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getMedicationAdherence(userId: string, medicationId: number, days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const logs = await db.select().from(medicationLogs).where(
      and(
        eq(medicationLogs.userId, userId),
        eq(medicationLogs.medicationId, medicationId),
        gte(medicationLogs.takenAt, cutoffDate)
      )
    );
    
    const totalExpected = days; // Simplified calculation
    const totalTaken = logs.filter(log => !log.missed).length;
    
    return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
  }

  // Symptom operations
  async getSymptoms(userId: string): Promise<Symptom[]> {
    return await db.select().from(symptoms).where(eq(symptoms.userId, userId));
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db
      .insert(symptoms)
      .values(symptom)
      .returning();
    return newSymptom;
  }

  async updateSymptom(id: number, symptom: Partial<InsertSymptom>): Promise<Symptom> {
    const [updated] = await db
      .update(symptoms)
      .set(symptom)
      .where(eq(symptoms.id, id))
      .returning();
    if (!updated) {
      throw new Error("Symptom not found");
    }
    return updated;
  }

  async deleteSymptom(id: number): Promise<void> {
    await db.delete(symptoms).where(eq(symptoms.id, id));
  }

  // Appointment operations
  async getAppointments(userId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.userId, userId));
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const now = new Date();
    return await db.select().from(appointments).where(
      and(
        eq(appointments.userId, userId),
        gte(appointments.appointmentDate, now),
        eq(appointments.status, 'scheduled')
      )
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    if (!updated) {
      throw new Error("Appointment not found");
    }
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Health Metrics operations
  async getHealthMetrics(userId: string, type?: string): Promise<HealthMetric[]> {
    if (type) {
      return await db.select().from(healthMetrics).where(
        and(eq(healthMetrics.userId, userId), eq(healthMetrics.type, type))
      );
    }
    return await db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [newMetric] = await db
      .insert(healthMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // AI Insights operations
  async getAiInsights(userId: string): Promise<AiInsight[]> {
    return await db.select().from(aiInsights).where(eq(aiInsights.userId, userId));
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [newInsight] = await db
      .insert(aiInsights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async markInsightAsRead(id: number): Promise<void> {
    await db
      .update(aiInsights)
      .set({ isRead: true })
      .where(eq(aiInsights.id, id));
  }

  // Reminder operations
  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async getTodayReminders(userId: string): Promise<Reminder[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.select().from(reminders).where(
      and(
        eq(reminders.userId, userId),
        gte(reminders.scheduledFor, today),
        lte(reminders.scheduledFor, tomorrow),
        eq(reminders.isCompleted, false)
      )
    );
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async markReminderCompleted(id: number): Promise<void> {
    await db
      .update(reminders)
      .set({ isCompleted: true })
      .where(eq(reminders.id, id));
  }

  // Health Report operations
  async getHealthReports(userId: string): Promise<HealthReport[]> {
    return await db.select().from(healthReports).where(eq(healthReports.userId, userId));
  }

  async createHealthReport(report: InsertHealthReport): Promise<HealthReport> {
    const [newReport] = await db
      .insert(healthReports)
      .values(report)
      .returning();
    return newReport;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    daysTracking: number;
    medicationsActive: number;
    upcomingAppointments: number;
  }> {
    const user = await this.getUser(userId);
    const daysTracking = user?.createdAt ? 
      Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const activeMedications = await this.getActiveMedications(userId);
    const upcomingAppointments = await this.getUpcomingAppointments(userId);
    
    return {
      daysTracking,
      medicationsActive: activeMedications.length,
      upcomingAppointments: upcomingAppointments.length,
    };
  }

  // Timeline data
  async getTimelineEvents(userId: string, limit = 10): Promise<Array<{
    id: number;
    type: 'symptom' | 'medication' | 'appointment' | 'metric';
    title: string;
    description: string;
    date: Date;
    severity?: number;
    tags: string[];
  }>> {
    const events: Array<{
      id: number;
      type: 'symptom' | 'medication' | 'appointment' | 'metric';
      title: string;
      description: string;
      date: Date;
      severity?: number;
      tags: string[];
    }> = [];

    // Add symptoms
    const symptomsData = await this.getSymptoms(userId);
    symptomsData.forEach(symptom => {
      events.push({
        id: symptom.id,
        type: 'symptom',
        title: `Symptom: ${symptom.name}`,
        description: symptom.notes || `Severity: ${symptom.severity}/10`,
        date: symptom.occurredAt,
        severity: symptom.severity,
        tags: ['symptom', ...(symptom.triggers || [])],
      });
    });

    // Add medication logs
    const medicationLogsData = await this.getMedicationLogs(userId);
    for (const log of medicationLogsData) {
      const [medication] = await db.select().from(medications).where(eq(medications.id, log.medicationId));
      if (medication) {
        events.push({
          id: log.id,
          type: 'medication',
          title: `Medication: ${medication.name}`,
          description: log.missed ? 'Missed dose' : `Taken: ${log.dosageTaken || medication.dosage}`,
          date: log.takenAt,
          tags: ['medication', log.missed ? 'missed' : 'taken'],
        });
      }
    }

    // Add appointments
    const appointmentsData = await this.getAppointments(userId);
    appointmentsData.forEach(appointment => {
      events.push({
        id: appointment.id,
        type: 'appointment',
        title: `Appointment: ${appointment.title}`,
        description: `${appointment.provider}${appointment.outcome ? ` - ${appointment.outcome}` : ''}`,
        date: appointment.appointmentDate,
        tags: ['appointment', appointment.type || 'general'],
      });
    });

    // Sort by date descending and limit
    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  // Transcription operations (Elevita's Ears)
  async getTranscriptions(userId: string): Promise<Transcription[]> {
    return await db.select().from(transcriptions)
      .where(eq(transcriptions.userId, userId))
      .orderBy(desc(transcriptions.recordedAt));
  }

  async getTranscription(id: number): Promise<Transcription | undefined> {
    const [transcription] = await db.select().from(transcriptions)
      .where(eq(transcriptions.id, id));
    return transcription || undefined;
  }

  async createTranscription(transcription: InsertTranscription): Promise<Transcription> {
    const [newTranscription] = await db
      .insert(transcriptions)
      .values(transcription)
      .returning();
    return newTranscription;
  }

  async updateTranscription(id: number, updates: Partial<InsertTranscription>): Promise<Transcription> {
    const [updated] = await db
      .update(transcriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transcriptions.id, id))
      .returning();
    if (!updated) {
      throw new Error("Transcription not found");
    }
    return updated;
  }

  async deleteTranscription(id: number): Promise<void> {
    await db.delete(transcriptions).where(eq(transcriptions.id, id));
  }

  async getTranscriptionsByDate(userId: string, date: string): Promise<Transcription[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(transcriptions)
      .where(
        and(
          eq(transcriptions.userId, userId),
          gte(transcriptions.recordedAt, startOfDay),
          lte(transcriptions.recordedAt, endOfDay)
        )
      )
      .orderBy(desc(transcriptions.recordedAt));
  }

  async getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getPatients(): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.isHealthcareProfessional, false));
  }

  // Create appointment
  async createAppointment(appointmentData: any): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  // Get appointments by date
  async getAppointmentsByDate(date?: string): Promise<Appointment[]> {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      return await db
        .select()
        .from(appointments)
        .where(
          and(
            gte(appointments.appointmentDate, startDate),
            lt(appointments.appointmentDate, endDate)
          )
        )
        .orderBy(appointments.appointmentDate);
    } else {
      return await db
        .select()
        .from(appointments)
        .orderBy(appointments.appointmentDate);
    }
  }

  // Enhanced transcriptions by date for calendar integration
  async getTranscriptionsByDate(userId: string, date?: string): Promise<Transcription[]> {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      return await db
        .select()
        .from(transcriptions)
        .where(
          and(
            eq(transcriptions.userId, userId),
            gte(transcriptions.createdAt, startDate),
            lt(transcriptions.createdAt, endDate)
          )
        )
        .orderBy(desc(transcriptions.createdAt));
    } else {
      return await db
        .select()
        .from(transcriptions)
        .where(eq(transcriptions.userId, userId))
        .orderBy(desc(transcriptions.createdAt));
    }
  }

  // Notification operations
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Notification settings operations
  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    const [settings] = await db.select().from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    return settings || undefined;
  }

  async upsertNotificationSettings(userId: string, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    const [upserted] = await db
      .insert(notificationSettings)
      .values({ ...settings, userId })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async scheduleNotification(notification: InsertNotification): Promise<Notification> {
    // For scheduled notifications, set scheduledFor timestamp
    return await this.createNotification(notification);
  }

  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await db.select().from(notifications)
      .where(and(
        gte(notifications.scheduledFor, now),
        eq(notifications.isRead, false)
      ));

    // Process each scheduled notification (send push notification, email, etc.)
    // This would integrate with notification services
    for (const notification of scheduledNotifications) {
      // TODO: Implement actual notification sending (push, email, etc.)
      console.log(`Processing notification: ${notification.title} for user: ${notification.userId}`);
    }
  }
}

export const storage = new DatabaseStorage();
