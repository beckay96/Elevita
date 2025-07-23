import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SmartAppointmentForm } from "./smart-appointment-form";
import { QuickTranscriptionStarter } from "./quick-transcription-starter";
import { 
  Calendar,
  Clock,
  User,
  Mic,
  Plus,
  FileText,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Appointment, Transcription, User as UserType } from "@shared/schema";

interface CalendarSchedulerProps {
  onStartTranscription: (appointmentId: number, patientId: string, title: string) => void;
}

interface TranscriptionEditState {
  id: number;
  title: string;
  description: string;
  transcript: string;
}

export function CalendarScheduler({ onStartTranscription }: CalendarSchedulerProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTranscription, setEditingTranscription] = useState<TranscriptionEditState | null>(null);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    patientName: "",
    type: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration: 60,
    notes: ""
  });

  // Get appointments for selected date
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", format(selectedDate, "yyyy-MM-dd")],
  }) as { data: Appointment[], isLoading: boolean };

  // Get patients (all users who are not healthcare professionals)
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  }) as { data: UserType[] };

  // Get transcriptions for selected date
  const { data: transcriptions = [] } = useQuery({
    queryKey: ["/api/transcriptions", format(selectedDate, "yyyy-MM-dd")],
  }) as { data: Transcription[] };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (appointment: any) => apiRequest("POST", "/api/appointments", appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      setNewAppointmentOpen(false);
      setNewAppointment({
        title: "",
        patientName: "",
        type: "",
        appointmentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        duration: 60,
        notes: ""
      });
    },
  });

  // Update transcription mutation
  const updateTranscriptionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<TranscriptionEditState> }) =>
      apiRequest("PATCH", `/api/transcriptions/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcriptions"] });
      toast({
        title: "Success",
        description: "Transcription updated successfully",
      });
      setEditingTranscription(null);
    },
  });

  const handleCreateAppointment = () => {
    if (!newAppointment.title || !newAppointment.patientName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Find patient by name
    const patient = patients.find((p: UserType) => 
      `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(newAppointment.patientName.toLowerCase())
    );

    if (!patient) {
      toast({
        title: "Error",
        description: "Patient not found. Please check the name.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      ...newAppointment,
      userId: patient.id,
      appointmentDate: new Date(newAppointment.appointmentDate).toISOString(),
    });
  };

  const handleEditTranscription = (transcription: Transcription) => {
    setEditingTranscription({
      id: transcription.id,
      title: transcription.title,
      description: transcription.description || "",
      transcript: transcription.transcript,
    });
  };

  const handleSaveTranscription = () => {
    if (!editingTranscription) return;
    
    updateTranscriptionMutation.mutate({
      id: editingTranscription.id,
      updates: {
        title: editingTranscription.title,
        description: editingTranscription.description,
        transcript: editingTranscription.transcript,
      },
    });
  };

  const generateDateRange = () => {
    const dates = [];
    for (let i = -3; i <= 10; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  const dateRange = generateDateRange();

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule & Transcriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateRange.map((date) => (
              <Button
                key={date.toISOString()}
                variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(date)}
                className="flex-shrink-0"
              >
                <div className="text-center">
                  <div className="text-xs">{format(date, "EEE")}</div>
                  <div className="font-semibold">{format(date, "d")}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointments for Selected Date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Appointments - {format(selectedDate, "EEEE, MMMM d")}
          </CardTitle>
          <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Appointment Title *</Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Follow-up consultation"
                  />
                </div>
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={newAppointment.patientName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Search patient by name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Appointment Type</Label>
                  <Input
                    id="type"
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., Consultation, Check-up"
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentDate">Date & Time</Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the appointment"
                  />
                </div>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={createAppointmentMutation.isPending}
                  className="w-full"
                >
                  {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{appointment.title}</h3>
                      <Badge variant="outline">{appointment.type}</Badge>
                      <Badge variant={
                        appointment.status === "completed" ? "default" : 
                        appointment.status === "cancelled" ? "destructive" : "secondary"
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(appointment.appointmentDate), "HH:mm")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Patient ID: {appointment.userId}
                      </span>
                      {appointment.duration && (
                        <span>{appointment.duration} min</span>
                      )}
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onStartTranscription(
                        appointment.id,
                        appointment.userId,
                        `${appointment.title} - ${format(new Date(appointment.appointmentDate), "HH:mm")}`
                      )}
                      className="flex items-center gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcriptions for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcriptions - {format(selectedDate, "EEEE, MMMM d")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transcriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transcriptions for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="border rounded-lg p-4">
                  {editingTranscription?.id === transcription.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editTitle">Title</Label>
                        <Input
                          id="editTitle"
                          value={editingTranscription.title}
                          onChange={(e) => setEditingTranscription(prev => 
                            prev ? { ...prev, title: e.target.value } : null
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editDescription">Description</Label>
                        <Textarea
                          id="editDescription"
                          value={editingTranscription.description}
                          onChange={(e) => setEditingTranscription(prev => 
                            prev ? { ...prev, description: e.target.value } : null
                          )}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editTranscript">Transcript</Label>
                        <Textarea
                          id="editTranscript"
                          value={editingTranscription.transcript}
                          onChange={(e) => setEditingTranscription(prev => 
                            prev ? { ...prev, transcript: e.target.value } : null
                          )}
                          rows={6}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveTranscription}
                          disabled={updateTranscriptionMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTranscription(null)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{transcription.title}</h3>
                          {transcription.description && (
                            <p className="text-sm text-muted-foreground">{transcription.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transcription.recordedAt), "HH:mm")}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTranscription(transcription)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm whitespace-pre-wrap">{transcription.transcript}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Duration: {Math.floor(transcription.duration / 60)}:{(transcription.duration % 60).toString().padStart(2, '0')}</span>
                        {transcription.patientId && (
                          <span>Patient: {transcription.patientId}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}