import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, isSameDay, startOfWeek, endOfWeek } from "date-fns";
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
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import type { Appointment, Transcription, User as UserType } from "@shared/schema";

interface EnhancedCalendarSchedulerProps {
  onStartTranscription: (appointmentId: number, patientId: string, title: string) => void;
}

interface TranscriptionEditState {
  id: number;
  title: string;
  description: string;
  transcript: string;
}

export function EnhancedCalendarScheduler({ onStartTranscription }: EnhancedCalendarSchedulerProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTranscription, setEditingTranscription] = useState<TranscriptionEditState | null>(null);
  const [showSmartForm, setShowSmartForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  // Get appointments for selected date
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", format(selectedDate, "yyyy-MM-dd")],
  }) as { data: Appointment[], isLoading: boolean };

  // Get transcriptions for selected date
  const { data: transcriptions = [] } = useQuery({
    queryKey: ["/api/transcriptions", format(selectedDate, "yyyy-MM-dd")],
  }) as { data: Transcription[] };

  // Update transcription mutation
  const updateTranscriptionMutation = useMutation({
    mutationFn: async (data: { id: number; title: string; description: string; transcript: string }) => {
      return apiRequest("PATCH", `/api/transcriptions/${data.id}`, {
        title: data.title,
        description: data.description,
        transcript: data.transcript
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcriptions", format(selectedDate, "yyyy-MM-dd")] });
      setEditingTranscription(null);
      toast({
        title: "Success",
        description: "Transcription updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update transcription",
        variant: "destructive",
      });
    },
  });

  const handleSaveTranscription = () => {
    if (editingTranscription) {
      updateTranscriptionMutation.mutate(editingTranscription);
    }
  };

  // Generate week view dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter appointments based on search and type
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchQuery || 
      appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.userId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filterType || appointment.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Filter transcriptions based on search
  const filteredTranscriptions = transcriptions.filter(transcription => {
    return !searchQuery || 
      transcription.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transcription.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get unique appointment types for filter
  const appointmentTypes = [...new Set(appointments.map(a => a.type).filter(Boolean))];

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Search and Filters */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Calendar & Scheduling</CardTitle>
              <p className="text-muted-foreground mt-1">
                Manage appointments and start transcription sessions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Type Filter */}
              {appointmentTypes.length > 0 && (
                <select 
                  className="px-3 py-2 border rounded-md bg-background"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {appointmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
              
              {/* Add Appointment Button */}
              <Button onClick={() => setShowSmartForm(true)} className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Smart Date Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week View Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Week View</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map(date => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const dayAppointments = appointments.filter(apt => 
                  isSameDay(new Date(apt.appointmentDate), date)
                );
                
                return (
                  <Button
                    key={date.toISOString()}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`h-12 p-1 flex flex-col items-center justify-center relative ${
                      isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    {dayAppointments.length > 0 && (
                      <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  {isSameDay(selectedDate, new Date()) && (
                    <Badge variant="secondary">Today</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Appointments for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading appointments...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for this date</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowSmartForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <QuickTranscriptionStarter
                      key={appointment.id}
                      appointment={appointment}
                      onStartTranscription={onStartTranscription}
                    />
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
                Transcriptions ({filteredTranscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTranscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transcriptions for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTranscriptions.map((transcription) => (
                    <div key={transcription.id} className="border rounded-lg p-4">
                      {editingTranscription?.id === transcription.id ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="editTitle">Title</Label>
                            <Input
                              id="editTitle"
                              value={editingTranscription?.title || ''}
                              onChange={(e) => setEditingTranscription(prev => 
                                prev ? { ...prev, title: e.target.value } : null
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                              id="editDescription"
                              value={editingTranscription?.description || ''}
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
                              value={editingTranscription?.transcript || ''}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTranscription({
                                id: transcription.id,
                                title: transcription.title,
                                description: transcription.description || '',
                                transcript: transcription.transcript
                              })}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-sm whitespace-pre-wrap line-clamp-4">
                              {transcription.transcript || "No transcript available yet..."}
                            </p>
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
      </div>

      {/* Smart Appointment Form Dialog */}
      <Dialog open={showSmartForm} onOpenChange={setShowSmartForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <SmartAppointmentForm
            selectedDate={selectedDate}
            onClose={() => setShowSmartForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
              setShowSmartForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}