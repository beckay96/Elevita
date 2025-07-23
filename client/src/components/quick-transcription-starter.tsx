import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Clock, 
  User, 
  Calendar,
  Play,
  FileText
} from "lucide-react";
import type { Appointment } from "@shared/schema";

interface QuickTranscriptionStarterProps {
  appointment: Appointment;
  onStartTranscription: (appointmentId: number, patientId: string, title: string) => void;
}

// Smart transcription title templates based on appointment type
const TRANSCRIPTION_TEMPLATES = {
  consultation: "Initial Consultation Recording",
  followup: "Follow-up Visit Notes",
  checkup: "Health Checkup Recording",
  urgent: "Urgent Care Documentation",
  therapy: "Therapy Session Notes",
  procedure: "Procedure Documentation"
};

export function QuickTranscriptionStarter({ appointment, onStartTranscription }: QuickTranscriptionStarterProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTranscriptionTitle = () => {
    const template = TRANSCRIPTION_TEMPLATES[appointment.type as keyof typeof TRANSCRIPTION_TEMPLATES];
    return template ? `${template} - ${appointment.title}` : `Recording - ${appointment.title}`;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      consultation: "bg-blue-500",
      followup: "bg-green-500",
      checkup: "bg-purple-500",
      urgent: "bg-red-500",
      therapy: "bg-indigo-500",
      procedure: "bg-orange-500"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const handleStartRecording = () => {
    onStartTranscription(
      appointment.id,
      appointment.userId,
      getTranscriptionTitle()
    );
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer border-2 ${
        isHovered ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-primary/50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getTypeColor(appointment.type || '')}`} />
            {appointment.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {appointment.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Appointment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(appointment.appointmentDate), "HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Patient ID: {appointment.userId}</span>
          </div>
        </div>
        
        {/* Duration & Location */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{appointment.duration || 30} minutes</span>
          </div>
          {appointment.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="truncate">{appointment.location}</span>
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {appointment.notes && (
          <div className="bg-muted/50 rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Quick Action Button */}
        <Button 
          onClick={handleStartRecording}
          className={`w-full transition-all duration-200 ${
            isHovered ? 'shadow-md' : ''
          }`}
          size="lg"
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Recording Session
        </Button>
        
        {/* Smart Preview */}
        <div className="text-xs text-muted-foreground text-center border-t pt-3">
          Recording will be saved as: <span className="font-medium">"{getTranscriptionTitle()}"</span>
        </div>
      </CardContent>
    </Card>
  );
}