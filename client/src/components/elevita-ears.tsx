import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { AudioWaveform } from "./audio-waveform";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  FileText, 
  Clock, 
  Download,
  Trash2,
  Edit,
  Volume2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Transcription {
  id: number;
  title: string;
  description?: string;
  transcript: string;
  duration: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ElevitaEarsProps {
  className?: string;
  appointmentId?: number;
  patientId?: string;
  defaultTitle?: string;
}

export function ElevitaEars({ className, appointmentId, patientId, defaultTitle }: ElevitaEarsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state for new recording
  const [recordingTitle, setRecordingTitle] = useState(defaultTitle || "");
  const [recordingDescription, setRecordingDescription] = useState("");
  
  // Media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch transcriptions
  const { data: transcriptions, isLoading } = useQuery<Transcription[]>({
    queryKey: ["/api/transcriptions"],
    retry: false,
  });

  // Create transcription mutation
  const createTranscription = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('title', recordingTitle || 'Untitled Recording');
      formData.append('description', recordingDescription || '');
      if (appointmentId) formData.append('appointmentId', appointmentId.toString());
      if (patientId) formData.append('patientId', patientId);
      
      return apiRequest("POST", "/api/transcriptions", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcriptions"] });
      toast({
        title: "Success",
        description: "Recording transcribed successfully",
      });
      setRecordingTitle("");
      setRecordingDescription("");
      setIsProcessing(false);
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
        description: "Failed to process recording. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Delete transcription mutation
  const deleteTranscription = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/transcriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcriptions"] });
      toast({
        title: "Success",
        description: "Transcription deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete transcription",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      toast({
        title: "Recording Started",
        description: "Elevita's Ears is now listening...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setIsProcessing(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const processRecording = (audioBlob: Blob) => {
    if (!recordingTitle.trim()) {
      setRecordingTitle(`Recording ${new Date().toLocaleTimeString()}`);
    }
    createTranscription.mutate(audioBlob);
  };

  const handleDelete = (id: number) => {
    deleteTranscription.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Main Recording Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            Elevita's Ears
            <Badge variant="secondary" className="ml-auto">Speech-to-Text</Badge>
          </CardTitle>
          <CardDescription>
            Record consultations and meetings for simple speech-to-text transcription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            {/* Audio Waveform Visualization */}
            <div className="bg-card/50 border rounded-lg p-4 mb-4">
              <AudioWaveform isRecording={isRecording} isPaused={isPaused} />
              {isRecording && (
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Recording</DialogTitle>
                      <DialogDescription>
                        Provide details for your recording session
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Recording Title</Label>
                        <Input
                          id="title"
                          value={recordingTitle}
                          onChange={(e) => setRecordingTitle(e.target.value)}
                          placeholder="e.g., Patient Consultation - John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={recordingDescription}
                          onChange={(e) => setRecordingDescription(e.target.value)}
                          placeholder="e.g., Follow-up appointment for chest pain evaluation"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                  >
                    {isPaused ? (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Stop & Process
                  </Button>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Processing transcription...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transcriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Transcriptions
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading transcriptions...</p>
            </div>
          ) : !transcriptions || transcriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No transcriptions yet</h3>
              <p className="text-muted-foreground text-sm">
                Start your first recording to see transcriptions here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcriptions.slice(0, 5).map((transcription) => (
                <div
                  key={transcription.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{transcription.title}</h4>
                      {transcription.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {transcription.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(transcription.duration)}
                        </span>
                        <span>
                          {new Date(transcription.recordedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transcription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Transcript Preview */}
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Transcript Preview</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {transcription.transcript}
                    </p>
                  </div>
                </div>
              ))}
              
              {transcriptions.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Transcriptions ({transcriptions.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for backward compatibility
export default ElevitaEars;