import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";
import NavigationHeader from "@/components/navigation-header";
import SymptomForm from "@/components/symptom-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, MapPin, Activity } from "lucide-react";
import type { Symptom } from "@shared/schema";

export default function Symptoms() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: symptoms, isLoading: symptomsLoading } = useQuery({
    queryKey: ["/api/symptoms"],
    retry: false,
    enabled: isAuthenticated,
  });

  const deleteSymptom = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/symptoms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      toast({
        title: "Success",
        description: "Symptom deleted successfully",
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
        description: "Failed to delete symptom",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (symptom: Symptom) => {
    setEditingSymptom(symptom);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSymptom(null);
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-elevita-bright-teal";
    if (severity <= 6) return "bg-yellow-400";
    return "bg-red-500";
  };

  const getSeverityText = (severity: number) => {
    if (severity <= 3) return "Mild";
    if (severity <= 6) return "Moderate";
    return "Severe";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elevita-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-elevita-black">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Symptoms</h1>
            <p className="text-gray-300">Track and monitor your symptoms over time</p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-teal hover:opacity-90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Log Symptom
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-elevita-dark-gray border-elevita-medium-gray/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingSymptom ? 'Edit Symptom' : 'Log New Symptom'}
                </DialogTitle>
              </DialogHeader>
              <SymptomForm 
                symptom={editingSymptom} 
                onSuccess={handleFormClose} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {symptomsLoading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading symptoms...</div>
          </div>
        ) : !symptoms || symptoms.length === 0 ? (
          <Card className="bg-elevita-dark-gray/50 backdrop-blur-md border-elevita-medium-gray/20">
            <CardContent className="py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-elevita-teal mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Symptoms Logged</h3>
                <p className="text-gray-300 mb-6">
                  Start tracking your symptoms to identify patterns and share insights with your healthcare team.
                </p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-teal hover:opacity-90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Symptom
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {symptoms.map((symptom: Symptom) => (
              <Card key={symptom.id} className="bg-elevita-dark-gray/50 backdrop-blur-md border-elevita-medium-gray/20">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">
                        {symptom.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${getSeverityColor(symptom.severity)} text-white text-xs`}
                        >
                          {getSeverityText(symptom.severity)} ({symptom.severity}/10)
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(symptom)}
                        className="text-elevita-bright-teal hover:bg-elevita-medium-gray/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSymptom.mutate(symptom.id)}
                        disabled={deleteSymptom.isPending}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-elevita-light-teal" />
                      <span className="text-gray-300">{formatDate(symptom.occurredAt.toString())}</span>
                    </div>
                    
                    {symptom.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-elevita-light-purple" />
                        <span className="text-gray-300">{symptom.location}</span>
                      </div>
                    )}
                    
                    {symptom.duration && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-elevita-purple" />
                        <span className="text-gray-300">Duration: {symptom.duration}</span>
                      </div>
                    )}
                    
                    {symptom.notes && (
                      <p className="text-sm text-gray-300 mt-2">
                        {symptom.notes}
                      </p>
                    )}
                    
                    {symptom.triggers && symptom.triggers.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-1">Triggers:</div>
                        <div className="flex flex-wrap gap-1">
                          {symptom.triggers.map((trigger, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-elevita-teal/20 text-elevita-bright-teal"
                            >
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {symptom.resolvedAt && (
                      <div className="text-xs text-green-400 mt-3">
                        Resolved: {formatDate(symptom.resolvedAt.toString())}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
