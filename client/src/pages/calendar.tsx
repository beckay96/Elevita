import { useState } from "react";
import { CalendarScheduler } from "@/components/calendar-scheduler";
import { ElevitaEars } from "@/components/elevita-ears";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Mic } from "lucide-react";

export function CalendarPage() {
  const [activeTranscription, setActiveTranscription] = useState<{
    appointmentId: number;
    patientId: string;
    title: string;
  } | null>(null);

  const handleStartTranscription = (appointmentId: number, patientId: string, title: string) => {
    setActiveTranscription({ appointmentId, patientId, title });
  };

  const handleBackToCalendar = () => {
    setActiveTranscription(null);
  };

  if (activeTranscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToCalendar}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Recording Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">Patient: {activeTranscription.patientId}</Badge>
                <Badge variant="secondary">Appointment: {activeTranscription.title}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <ElevitaEars 
          appointmentId={activeTranscription.appointmentId}
          patientId={activeTranscription.patientId}
          defaultTitle={activeTranscription.title}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Calendar & Scheduling
        </h1>
        <p className="text-muted-foreground">
          Manage appointments and start transcription sessions for patient consultations
        </p>
      </div>
      
      <CalendarScheduler onStartTranscription={handleStartTranscription} />
    </div>
  );
}