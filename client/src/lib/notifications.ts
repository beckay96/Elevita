import { apiRequest } from "./queryClient";
import type { InsertNotification, NotificationSettings } from "@shared/schema";

// Notification utility functions for triggering notifications across features
export class NotificationService {
  
  static async createNotification(notification: Omit<InsertNotification, 'userId'>) {
    try {
      return await apiRequest('POST', '/api/notifications', notification);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  static async getUserSettings(): Promise<NotificationSettings | null> {
    try {
      return await apiRequest('GET', '/api/settings/notifications');
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      return null;
    }
  }

  // Feature-specific notification triggers
  static async triggerMedicationReminder(medicationName: string, dosage: string, scheduledTime: Date) {
    const settings = await this.getUserSettings();
    if (!settings?.medicationReminders) return;

    return this.createNotification({
      type: 'medication_reminder',
      title: `Time for ${medicationName}`,
      message: `Don't forget to take your ${dosage} of ${medicationName}`,
      isActionable: true,
      actionUrl: '/medications',
      scheduledFor: scheduledTime,
      metadata: { medicationName, dosage },
    });
  }

  static async triggerAppointmentReminder(appointmentTitle: string, appointmentTime: Date, doctorName?: string) {
    const settings = await this.getUserSettings();
    if (!settings?.appointmentReminders) return;

    const reminderTime = new Date(appointmentTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before

    return this.createNotification({
      type: 'appointment_reminder',
      title: 'Upcoming Appointment',
      message: `You have an appointment tomorrow: ${appointmentTitle}${doctorName ? ` with ${doctorName}` : ''}`,
      isActionable: true,
      actionUrl: '/appointments',
      scheduledFor: reminderTime,
      metadata: { appointmentTitle, appointmentTime: appointmentTime.toISOString(), doctorName },
    });
  }

  static async triggerHealthAlert(title: string, message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    const settings = await this.getUserSettings();
    if (!settings?.healthAlerts) return;

    return this.createNotification({
      type: 'health_alert',
      title,
      message,
      isActionable: true,
      actionUrl: '/timeline',
      metadata: { severity },
    });
  }

  static async triggerAIInsight(insight: string, relatedData?: any) {
    const settings = await this.getUserSettings();
    if (!settings?.aiInsights) return;

    return this.createNotification({
      type: 'ai_insight',
      title: 'New Health Insight',
      message: insight,
      isActionable: true,
      actionUrl: '/timeline',
      metadata: relatedData,
    });
  }

  static async triggerWeeklyReport(summary: string) {
    const settings = await this.getUserSettings();
    if (!settings?.weeklyReports) return;

    return this.createNotification({
      type: 'weekly_report',
      title: 'Your Weekly Health Summary',
      message: summary,
      isActionable: true,
      actionUrl: '/reports',
      metadata: { reportType: 'weekly' },
    });
  }

  static async triggerEmergencyAlert(title: string, message: string, actionUrl?: string) {
    // Emergency alerts ignore user settings and are always sent
    return this.createNotification({
      type: 'emergency_alert',
      title,
      message,
      isActionable: true,
      actionUrl: actionUrl || '/timeline',
      metadata: { priority: 'emergency' },
    });
  }

  // Symptom severity monitoring
  static async checkSymptomSeverity(symptomName: string, severity: number, previousSeverity?: number) {
    if (severity >= 8) {
      await this.triggerHealthAlert(
        'High Severity Symptom Alert',
        `You've logged ${symptomName} with severity ${severity}/10. Consider contacting your healthcare provider.`,
        'high'
      );
    } else if (previousSeverity && severity > previousSeverity + 2) {
      await this.triggerHealthAlert(
        'Symptom Worsening Alert',
        `Your ${symptomName} has increased in severity. Current: ${severity}/10, Previous: ${previousSeverity}/10.`,
        'medium'
      );
    }
  }

  // Medication adherence monitoring
  static async checkMedicationAdherence(medicationName: string, adherenceRate: number) {
    if (adherenceRate < 80) {
      await this.triggerHealthAlert(
        'Low Medication Adherence',
        `Your adherence for ${medicationName} is ${adherenceRate}%. Consistent medication taking is important for your health.`,
        'medium'
      );
    }
  }

  // Professional feature notifications
  static async triggerTranscriptionComplete(patientName: string, duration: number) {
    const settings = await this.getUserSettings();
    if (!settings?.aiInsights) return;

    return this.createNotification({
      type: 'transcription_complete',
      title: 'Transcription Ready',
      message: `Transcription for ${patientName} session (${Math.round(duration / 60)} minutes) is ready for review.`,
      isActionable: true,
      actionUrl: '/professional',
      metadata: { patientName, duration },
    });
  }
}