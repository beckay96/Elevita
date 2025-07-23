import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  generateHealthInsights, 
  translateClinicalTerm, 
  generateProviderSummary,
  type HealthInsightData 
} from "./openai";
import {
  insertMedicationSchema,
  insertSymptomSchema,
  insertAppointmentSchema,
  insertHealthMetricSchema,
  insertReminderSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Setup Wizard routes
  app.post('/api/setup/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userRole, isHealthcareProfessional } = req.body;
      
      const updatedUser = await storage.updateUserSetup(userId, {
        userRole,
        isHealthcareProfessional,
        setupStep: 1,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/setup/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      const updatedUser = await storage.updateUserSetup(userId, {
        firstName,
        lastName,
        setupStep: 2,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.post('/api/setup/professional', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { licenseNumber, specialty, institution, yearsExperience } = req.body;
      
      const updatedUser = await storage.updateUserSetup(userId, {
        licenseNumber,
        specialty,
        institution,
        yearsExperience,
        setupStep: 3,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating professional info:", error);
      res.status(500).json({ message: "Failed to update professional info" });
    }
  });

  app.post('/api/setup/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.completeUserSetup(userId);
      res.json(user);
    } catch (error) {
      console.error("Error completing setup:", error);
      res.status(500).json({ message: "Failed to complete setup" });
    }
  });

  app.post('/api/user/switch-view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { currentView } = req.body;
      
      const updatedUser = await storage.updateUserSetup(userId, {
        currentView,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error switching view:", error);
      res.status(500).json({ message: "Failed to switch view" });
    }
  });

  // Health Profile routes
  app.get('/api/health-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getHealthProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching health profile:", error);
      res.status(500).json({ message: "Failed to fetch health profile" });
    }
  });

  app.post('/api/health-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingProfile = await storage.getHealthProfile(userId);
      
      if (existingProfile) {
        const updated = await storage.updateHealthProfile(userId, req.body);
        res.json(updated);
      } else {
        const profile = await storage.createHealthProfile({ ...req.body, userId });
        res.json(profile);
      }
    } catch (error) {
      console.error("Error saving health profile:", error);
      res.status(500).json({ message: "Failed to save health profile" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const timeline = await storage.getTimelineEvents(userId, limit);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.get('/api/dashboard/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getTodayReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // Medication routes
  app.get('/api/medications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post('/api/medications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationData = insertMedicationSchema.parse({ ...req.body, userId });
      const medication = await storage.createMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      console.error("Error creating medication:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid medication data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create medication" });
      }
    }
  });

  app.patch('/api/medications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.updateMedication(id, req.body);
      res.json(medication);
    } catch (error) {
      console.error("Error updating medication:", error);
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  app.delete('/api/medications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedication(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting medication:", error);
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Medication log routes
  app.get('/api/medications/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationId = parseInt(req.params.id);
      const logs = await storage.getMedicationLogs(userId, medicationId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      res.status(500).json({ message: "Failed to fetch medication logs" });
    }
  });

  app.post('/api/medications/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationId = parseInt(req.params.id);
      const logData = { ...req.body, userId, medicationId };
      const log = await storage.createMedicationLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating medication log:", error);
      res.status(500).json({ message: "Failed to log medication" });
    }
  });

  // Symptom routes
  app.get('/api/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const symptoms = await storage.getSymptoms(userId);
      res.json(symptoms);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  app.post('/api/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const symptomData = insertSymptomSchema.parse({ ...req.body, userId });
      const symptom = await storage.createSymptom(symptomData);
      res.status(201).json(symptom);
    } catch (error) {
      console.error("Error creating symptom:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create symptom" });
      }
    }
  });

  app.patch('/api/symptoms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const symptom = await storage.updateSymptom(id, req.body);
      res.json(symptom);
    } catch (error) {
      console.error("Error updating symptom:", error);
      res.status(500).json({ message: "Failed to update symptom" });
    }
  });

  app.delete('/api/symptoms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSymptom(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting symptom:", error);
      res.status(500).json({ message: "Failed to delete symptom" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointmentData = insertAppointmentSchema.parse({ ...req.body, userId });
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });

  // AI Insights routes
  app.get('/api/ai-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getAiInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  app.post('/api/ai-insights/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Gather user's health data
      const symptoms = await storage.getSymptoms(userId);
      const medications = await storage.getActiveMedications(userId);
      const appointments = await storage.getAppointments(userId);
      const metrics = await storage.getHealthMetrics(userId);
      
      const healthData: HealthInsightData = {
        symptoms: symptoms.slice(0, 10).map(s => ({
          name: s.name,
          severity: s.severity,
          date: s.occurredAt,
          notes: s.notes || undefined
        })),
        medications: await Promise.all(medications.map(async (m) => {
          const adherence = await storage.getMedicationAdherence(userId, m.id, 7);
          return {
            name: m.name,
            adherence,
            lastTaken: new Date() // Simplified
          };
        })),
        appointments: appointments.slice(0, 5).map(a => ({
          title: a.title,
          date: a.appointmentDate,
          outcome: a.outcome || undefined
        })),
        metrics: metrics.slice(0, 10).map(m => ({
          type: m.type,
          value: m.value,
          date: m.measuredAt
        }))
      };

      const generatedInsights = await generateHealthInsights(healthData);
      
      // Save insights to database
      const savedInsights = await Promise.all(
        generatedInsights.map(insight => 
          storage.createAiInsight({
            userId,
            type: insight.type,
            title: insight.title,
            content: insight.content,
            confidence: insight.confidence,
            dataPoints: {},
            isRead: false
          })
        )
      );

      res.json(savedInsights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Clinical translation route
  app.post('/api/translate-term', isAuthenticated, async (req: any, res) => {
    try {
      const { term } = req.body;
      if (!term || typeof term !== 'string') {
        return res.status(400).json({ message: "Term is required" });
      }

      const translation = await translateClinicalTerm(term);
      res.json(translation);
    } catch (error) {
      console.error("Error translating term:", error);
      res.status(500).json({ message: "Failed to translate clinical term" });
    }
  });

  // Health report generation
  app.post('/api/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { periodStart, periodEnd, reportType } = req.body;
      
      // Gather health data for the period
      const symptoms = await storage.getSymptoms(userId);
      const medications = await storage.getMedications(userId);
      const appointments = await storage.getAppointments(userId);
      const metrics = await storage.getHealthMetrics(userId);
      
      const healthData: HealthInsightData = {
        symptoms: symptoms.map(s => ({
          name: s.name,
          severity: s.severity,
          date: s.occurredAt,
          notes: s.notes || undefined
        })),
        medications: medications.map(m => ({
          name: m.name,
          adherence: 95, // Simplified
          lastTaken: new Date()
        })),
        appointments: appointments.map(a => ({
          title: a.title,
          date: a.appointmentDate,
          outcome: a.outcome || undefined
        })),
        metrics: metrics.map(m => ({
          type: m.type,
          value: m.value,
          date: m.measuredAt
        }))
      };

      const summary = await generateProviderSummary(userId, healthData);
      
      const report = await storage.createHealthReport({
        userId,
        title: `Health Summary - ${new Date().toLocaleDateString()}`,
        content: { summary, data: healthData },
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        reportType: reportType || 'summary',
        generatedAt: new Date()
      });

      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate health report" });
    }
  });

  // Mark reminder as completed
  app.patch('/api/reminders/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markReminderCompleted(id);
      res.status(200).json({ message: "Reminder marked as completed" });
    } catch (error) {
      console.error("Error completing reminder:", error);
      res.status(500).json({ message: "Failed to complete reminder" });
    }
  });

  // Transcription routes for Elevita's Ears
  app.get('/api/transcriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user is healthcare professional
      const user = await storage.getUser(userId);
      if (!user?.isHealthcareProfessional) {
        return res.status(403).json({ message: "Access denied: Professional features only" });
      }
      
      const transcriptions = await storage.getTranscriptions(userId);
      res.json(transcriptions);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
      res.status(500).json({ message: "Failed to fetch transcriptions" });
    }
  });

  app.post('/api/transcriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const user = await storage.getUser(userId);
      if (!user?.isHealthcareProfessional) {
        return res.status(403).json({ message: "Access denied: Professional features only" });
      }

      const { title, description, duration } = req.body;
      
      // TODO: Implement actual audio processing and AI transcription
      // For now, create a placeholder entry that will be updated when audio processing is implemented
      const transcription = await storage.createTranscription({
        userId,
        title: title || 'Untitled Recording',
        description: description || '',
        transcript: '', // Will be populated by AI transcription service
        aiSummary: '', // Will be populated by AI analysis service
        duration: parseInt(duration) || 0,
        speakers: [], // Will be populated by speaker identification service
        recordedAt: new Date(),
      });

      res.json(transcription);
    } catch (error) {
      console.error("Error creating transcription:", error);
      res.status(500).json({ message: "Failed to create transcription" });
    }
  });

  app.delete('/api/transcriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transcriptionId = parseInt(req.params.id);
      
      const user = await storage.getUser(userId);
      if (!user?.isHealthcareProfessional) {
        return res.status(403).json({ message: "Access denied: Professional features only" });
      }
      
      const transcription = await storage.getTranscription(transcriptionId);
      if (!transcription || transcription.userId !== userId) {
        return res.status(404).json({ message: "Transcription not found" });
      }
      
      await storage.deleteTranscription(transcriptionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting transcription:", error);
      res.status(500).json({ message: "Failed to delete transcription" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notification = await storage.createNotification({
        ...req.body,
        userId,
      });
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Notification settings routes
  app.get('/api/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getNotificationSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.upsertNotificationSettings(userId, {});
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.upsertNotificationSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
