import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings as SettingsIcon, 
  Pill, 
  Calendar, 
  AlertTriangle, 
  Brain, 
  FileText, 
  Mail, 
  Smartphone,
  Clock,
  Save,
  User,
  Shield,
  Moon,
  Sun
} from "lucide-react";
import type { NotificationSettings } from "@shared/schema";

interface NotificationSettingsForm {
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthAlerts: boolean;
  aiInsights: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
  reminderTime: string;
  reminderFrequency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<NotificationSettingsForm>({
    medicationReminders: true,
    appointmentReminders: true,
    healthAlerts: true,
    aiInsights: true,
    weeklyReports: false,
    emergencyAlerts: true,
    reminderTime: "09:00",
    reminderFrequency: "daily",
    emailNotifications: false,
    pushNotifications: true,
  });

  // Fetch notification settings
  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["/api/settings/notifications"],
    retry: false,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        medicationReminders: settings.medicationReminders,
        appointmentReminders: settings.appointmentReminders,
        healthAlerts: settings.healthAlerts,
        aiInsights: settings.aiInsights,
        weeklyReports: settings.weeklyReports,
        emergencyAlerts: settings.emergencyAlerts,
        reminderTime: settings.reminderTime,
        reminderFrequency: settings.reminderFrequency,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
      });
    }
  }, [settings]);

  // Update notification settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: Partial<NotificationSettingsForm>) => {
      return await apiRequest(`/api/settings/notifications`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/notifications"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwitchChange = (field: keyof NotificationSettingsForm, value: boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateSettings.mutate({ [field]: value });
  };

  const handleSelectChange = (field: keyof NotificationSettingsForm, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateSettings.mutate({ [field]: value });
  };

  const handleTimeChange = (value: string) => {
    const newFormData = { ...formData, reminderTime: value };
    setFormData(newFormData);
    updateSettings.mutate({ reminderTime: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and notification settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary">
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <User className="h-4 w-4 mr-3" />
                  Profile
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Shield className="h-4 w-4 mr-3" />
                  Privacy
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Health Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-500" />
                  Health Reminders
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive health-related notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Medication Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when it's time to take your medications
                    </p>
                  </div>
                  <Switch
                    checked={formData.medicationReminders}
                    onCheckedChange={(value) => handleSwitchChange('medicationReminders', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Appointment Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    checked={formData.appointmentReminders}
                    onCheckedChange={(value) => handleSwitchChange('appointmentReminders', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Health Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Important health notifications and reminders
                    </p>
                  </div>
                  <Switch
                    checked={formData.healthAlerts}
                    onCheckedChange={(value) => handleSwitchChange('healthAlerts', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Emergency Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Critical health alerts (always recommended)
                    </p>
                  </div>
                  <Switch
                    checked={formData.emergencyAlerts}
                    onCheckedChange={(value) => handleSwitchChange('emergencyAlerts', value)}
                  />
                </div>

              </CardContent>
            </Card>

            {/* AI & Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI & Insights
                </CardTitle>
                <CardDescription>
                  Manage AI-powered health insights and analysis notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">AI Health Insights</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive AI-generated health pattern analysis
                    </p>
                  </div>
                  <Switch
                    checked={formData.aiInsights}
                    onCheckedChange={(value) => handleSwitchChange('aiInsights', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Weekly Reports</Label>
                    <p className="text-xs text-muted-foreground">
                      Weekly health summary and progress reports
                    </p>
                  </div>
                  <Switch
                    checked={formData.weeklyReports}
                    onCheckedChange={(value) => handleSwitchChange('weeklyReports', value)}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Timing & Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Timing & Delivery
                </CardTitle>
                <CardDescription>
                  Customize when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Default Reminder Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                    <Select
                      value={formData.reminderFrequency}
                      onValueChange={(value) => handleSelectChange('reminderFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications directly on your device
                      </p>
                    </div>
                    <Switch
                      checked={formData.pushNotifications}
                      onCheckedChange={(value) => handleSwitchChange('pushNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(value) => handleSwitchChange('emailNotifications', value)}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}