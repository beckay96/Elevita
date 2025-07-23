import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addMinutes, setHours, setMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SmartDateTimePicker } from "./smart-date-time-picker";
import { 
  Calendar,
  Clock, 
  User,
  MapPin,
  FileText,
  X,
  Check,
  Plus
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

interface SmartAppointmentFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

// Common appointment types with smart defaults
const APPOINTMENT_TYPES = [
  { value: "consultation", label: "Consultation", duration: 30, color: "bg-blue-500" },
  { value: "followup", label: "Follow-up", duration: 15, color: "bg-green-500" },
  { value: "checkup", label: "General Checkup", duration: 45, color: "bg-purple-500" },
  { value: "urgent", label: "Urgent Care", duration: 20, color: "bg-red-500" },
  { value: "therapy", label: "Therapy Session", duration: 60, color: "bg-indigo-500" },
  { value: "procedure", label: "Minor Procedure", duration: 90, color: "bg-orange-500" },
];

// Common time slots
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Smart title suggestions based on type and patient
const generateSmartTitle = (type: string, patientName: string) => {
  const typeLabels = {
    consultation: "Initial Consultation",
    followup: "Follow-up Visit",
    checkup: "Health Checkup",
    urgent: "Urgent Care Visit",
    therapy: "Therapy Session",
    procedure: "Medical Procedure"
  };
  
  return patientName 
    ? `${typeLabels[type as keyof typeof typeLabels] || "Appointment"} - ${patientName}`
    : typeLabels[type as keyof typeof typeLabels] || "New Appointment";
};

// Smart description templates
const DESCRIPTION_TEMPLATES = {
  consultation: [
    "Initial assessment and treatment planning",
    "New patient consultation",
    "Comprehensive evaluation"
  ],
  followup: [
    "Review treatment progress",
    "Monitor ongoing condition",
    "Post-treatment assessment"
  ],
  checkup: [
    "Annual health screening",
    "Routine wellness check",
    "Preventive care visit"
  ],
  urgent: [
    "Acute symptom evaluation",
    "Emergency consultation",
    "Urgent care assessment"
  ],
  therapy: [
    "Physical therapy session",
    "Rehabilitation session",
    "Treatment therapy"
  ],
  procedure: [
    "Minor surgical procedure",
    "Diagnostic procedure",
    "Therapeutic intervention"
  ]
};

export function SmartAppointmentForm({ selectedDate: initialDate, onClose, onSuccess }: SmartAppointmentFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Main Office");
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);

  // Get patients with search functionality
  const { data: allPatients = [] } = useQuery({
    queryKey: ["/api/patients"],
  }) as { data: UserType[] };

  // Filter patients based on search query
  const filteredPatients = allPatients.filter(patient => {
    const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
    const email = patient.email?.toLowerCase() || '';
    const query = patientQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Auto-update title when type or patient changes
  useEffect(() => {
    if (appointmentType) {
      const newTitle = generateSmartTitle(appointmentType, selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
      setTitle(newTitle);
    }
  }, [appointmentType, selectedPatient]);

  // Auto-update duration when type changes
  useEffect(() => {
    if (appointmentType) {
      const typeConfig = APPOINTMENT_TYPES.find(t => t.value === appointmentType);
      if (typeConfig) {
        setDuration(typeConfig.duration);
      }
    }
  }, [appointmentType]);

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      return apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!appointmentType || !selectedTime || !selectedPatient) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Parse time and create appointment date
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = setMinutes(setHours(selectedDate, hours), minutes);

    createAppointment.mutate({
      title,
      type: appointmentType,
      appointmentDate,
      duration,
      userId: selectedPatient.id,
      provider: "Current User", // This would be the logged-in healthcare professional
      location,
      notes: description,
      status: "scheduled"
    });
  };

  const handlePatientSelect = (patient: UserType) => {
    setSelectedPatient(patient);
    setPatientQuery(`${patient.firstName} ${patient.lastName}`);
    setShowPatientSuggestions(false);
  };

  const handleDescriptionSelect = (template: string) => {
    setDescription(template);
    setShowDescriptionSuggestions(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            New Appointment - {format(selectedDate, "EEEE, MMMM d")}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appointment Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="type">Appointment Type *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {APPOINTMENT_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={appointmentType === type.value ? "default" : "outline"}
                className="justify-start p-3 h-auto"
                onClick={() => setAppointmentType(type.value)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.duration}min</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Patient Selection with Smart Search */}
        <div className="space-y-2">
          <Label htmlFor="patient">Patient *</Label>
          <div className="relative">
            <Input
              placeholder="Search patients by name or email..."
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setShowPatientSuggestions(true);
                if (!e.target.value) setSelectedPatient(null);
              }}
              onFocus={() => setShowPatientSuggestions(true)}
              className="pr-10"
            />
            <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            
            {showPatientSuggestions && patientQuery && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto">
                <CardContent className="p-2">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.slice(0, 5).map((patient) => (
                      <Button
                        key={patient.id}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                            <div className="text-sm text-muted-foreground">{patient.email}</div>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No patients found
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {selectedPatient && (
            <Badge variant="secondary" className="mt-2">
              <Check className="h-3 w-3 mr-1" />
              {selectedPatient.firstName} {selectedPatient.lastName}
            </Badge>
          )}
        </div>

        {/* Smart Date and Time Selection */}
        <div className="space-y-4">
          <SmartDateTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <Button
                  key={mins}
                  variant={duration === mins ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(mins)}
                  className="flex-1"
                >
                  {mins}m
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Title (Auto-generated but editable) */}
        <div className="space-y-2">
          <Label htmlFor="title">Appointment Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title will be auto-generated..."
          />
        </div>

        {/* Smart Description with Templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            {appointmentType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDescriptionSuggestions(!showDescriptionSuggestions)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Suggestions
              </Button>
            )}
          </div>
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add appointment notes or description..."
            rows={3}
          />
          
          {showDescriptionSuggestions && appointmentType && (
            <div className="flex flex-wrap gap-2 mt-2">
              {DESCRIPTION_TEMPLATES[appointmentType as keyof typeof DESCRIPTION_TEMPLATES]?.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDescriptionSelect(template)}
                  className="text-xs"
                >
                  {template}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Appointment location"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!appointmentType || !selectedTime || !selectedPatient || createAppointment.isPending}
          >
            {createAppointment.isPending ? "Creating..." : "Create Appointment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}