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
} from "@shared/schema";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private healthProfiles: Map<string, HealthProfile> = new Map();
  private medications: Map<number, Medication> = new Map();
  private medicationLogs: Map<number, MedicationLog> = new Map();
  private symptoms: Map<number, Symptom> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private healthMetrics: Map<number, HealthMetric> = new Map();
  private aiInsights: Map<number, AiInsight> = new Map();
  private reminders: Map<number, Reminder> = new Map();
  private healthReports: Map<number, HealthReport> = new Map();
  
  private currentId = 1;

  private getNextId(): number {
    return this.currentId++;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id!,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Health Profile operations
  async getHealthProfile(userId: string): Promise<HealthProfile | undefined> {
    return Array.from(this.healthProfiles.values()).find(p => p.userId === userId);
  }

  async createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile> {
    const id = this.getNextId();
    const newProfile: HealthProfile = {
      ...profile,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.healthProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateHealthProfile(userId: string, profile: Partial<InsertHealthProfile>): Promise<HealthProfile> {
    const existing = await this.getHealthProfile(userId);
    if (!existing) {
      throw new Error("Health profile not found");
    }
    const updated: HealthProfile = {
      ...existing,
      ...profile,
      updatedAt: new Date(),
    };
    this.healthProfiles.set(existing.id, updated);
    return updated;
  }

  // Medication operations
  async getMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(m => m.userId === userId);
  }

  async getActiveMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(m => m.userId === userId && m.isActive);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.getNextId();
    const newMedication: Medication = {
      ...medication,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medications.set(id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication> {
    const existing = this.medications.get(id);
    if (!existing) {
      throw new Error("Medication not found");
    }
    const updated: Medication = {
      ...existing,
      ...medication,
      updatedAt: new Date(),
    };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<void> {
    this.medications.delete(id);
  }

  // Medication Log operations
  async getMedicationLogs(userId: string, medicationId?: number): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values()).filter(log => 
      log.userId === userId && (!medicationId || log.medicationId === medicationId)
    );
  }

  async createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.getNextId();
    const newLog: MedicationLog = {
      ...log,
      id,
      createdAt: new Date(),
    };
    this.medicationLogs.set(id, newLog);
    return newLog;
  }

  async getMedicationAdherence(userId: string, medicationId: number, days: number): Promise<number> {
    const logs = await this.getMedicationLogs(userId, medicationId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentLogs = logs.filter(log => log.takenAt >= cutoffDate);
    const totalExpected = days; // Simplified calculation
    const totalTaken = recentLogs.filter(log => !log.missed).length;
    
    return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
  }

  // Symptom operations
  async getSymptoms(userId: string): Promise<Symptom[]> {
    return Array.from(this.symptoms.values()).filter(s => s.userId === userId);
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const id = this.getNextId();
    const newSymptom: Symptom = {
      ...symptom,
      id,
      createdAt: new Date(),
    };
    this.symptoms.set(id, newSymptom);
    return newSymptom;
  }

  async updateSymptom(id: number, symptom: Partial<InsertSymptom>): Promise<Symptom> {
    const existing = this.symptoms.get(id);
    if (!existing) {
      throw new Error("Symptom not found");
    }
    const updated: Symptom = {
      ...existing,
      ...symptom,
    };
    this.symptoms.set(id, updated);
    return updated;
  }

  async deleteSymptom(id: number): Promise<void> {
    this.symptoms.delete(id);
  }

  // Appointment operations
  async getAppointments(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.userId === userId);
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const now = new Date();
    return Array.from(this.appointments.values()).filter(a => 
      a.userId === userId && a.appointmentDate > now && a.status === 'scheduled'
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.getNextId();
    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) {
      throw new Error("Appointment not found");
    }
    const updated: Appointment = {
      ...existing,
      ...appointment,
      updatedAt: new Date(),
    };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }

  // Health Metrics operations
  async getHealthMetrics(userId: string, type?: string): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(m => 
      m.userId === userId && (!type || m.type === type)
    );
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.getNextId();
    const newMetric: HealthMetric = {
      ...metric,
      id,
      createdAt: new Date(),
    };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }

  // AI Insights operations
  async getAiInsights(userId: string): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(i => i.userId === userId);
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const id = this.getNextId();
    const newInsight: AiInsight = {
      ...insight,
      id,
      createdAt: new Date(),
    };
    this.aiInsights.set(id, newInsight);
    return newInsight;
  }

  async markInsightAsRead(id: number): Promise<void> {
    const insight = this.aiInsights.get(id);
    if (insight) {
      insight.isRead = true;
      this.aiInsights.set(id, insight);
    }
  }

  // Reminder operations
  async getReminders(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(r => r.userId === userId);
  }

  async getTodayReminders(userId: string): Promise<Reminder[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.reminders.values()).filter(r => 
      r.userId === userId && 
      r.scheduledFor >= today && 
      r.scheduledFor < tomorrow &&
      !r.isCompleted
    );
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.getNextId();
    const newReminder: Reminder = {
      ...reminder,
      id,
      createdAt: new Date(),
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async markReminderCompleted(id: number): Promise<void> {
    const reminder = this.reminders.get(id);
    if (reminder) {
      reminder.isCompleted = true;
      this.reminders.set(id, reminder);
    }
  }

  // Health Report operations
  async getHealthReports(userId: string): Promise<HealthReport[]> {
    return Array.from(this.healthReports.values()).filter(r => r.userId === userId);
  }

  async createHealthReport(report: InsertHealthReport): Promise<HealthReport> {
    const id = this.getNextId();
    const newReport: HealthReport = {
      ...report,
      id,
    };
    this.healthReports.set(id, newReport);
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
    const symptoms = await this.getSymptoms(userId);
    symptoms.forEach(symptom => {
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
    const medicationLogs = await this.getMedicationLogs(userId);
    for (const log of medicationLogs) {
      const medication = this.medications.get(log.medicationId);
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
    const appointments = await this.getAppointments(userId);
    appointments.forEach(appointment => {
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
}

export const storage = new MemStorage();
