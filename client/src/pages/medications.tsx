import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import MedicationForm from "@/components/medication-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, Clock, PillBottle, AlertCircle } from "lucide-react";
import type { Medication } from "@shared/schema";

export default function Medications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

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

  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ["/api/medications"],
    retry: false,
    enabled: isAuthenticated,
  });

  const deleteMedication = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Success",
        description: "Medication deleted successfully",
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
        description: "Failed to delete medication",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedication(null);
  };

  const getStatusColor = (medication: Medication) => {
    if (!medication.isActive) return "bg-gray-500";
    if (medication.endDate && new Date(medication.endDate) < new Date()) return "bg-orange-500";
    return "bg-elevita-bright-teal";
  };

  const getStatusText = (medication: Medication) => {
    if (!medication.isActive) return "Inactive";
    if (medication.endDate && new Date(medication.endDate) < new Date()) return "Expired";
    return "Active";
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
            <h1 className="text-3xl font-bold text-white mb-2">Medications</h1>
            <p className="text-gray-300">Manage your medications and track adherence</p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-teal hover:opacity-90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-elevita-dark-gray border-elevita-medium-gray/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                </DialogTitle>
              </DialogHeader>
              <MedicationForm 
                medication={editingMedication} 
                onSuccess={handleFormClose} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {medicationsLoading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading medications...</div>
          </div>
        ) : !medications || medications.length === 0 ? (
          <Card className="bg-elevita-dark-gray/50 backdrop-blur-md border-elevita-medium-gray/20">
            <CardContent className="py-12">
              <div className="text-center">
                <PillBottle className="h-12 w-12 text-elevita-teal mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Medications Added</h3>
                <p className="text-gray-300 mb-6">
                  Start by adding your first medication to track adherence and get reminders.
                </p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-teal hover:opacity-90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Medication
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((medication: Medication) => (
              <Card key={medication.id} className="bg-elevita-dark-gray/50 backdrop-blur-md border-elevita-medium-gray/20">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">
                        {medication.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${getStatusColor(medication)} text-white text-xs`}
                        >
                          {getStatusText(medication)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(medication)}
                        className="text-elevita-bright-teal hover:bg-elevita-medium-gray/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMedication.mutate(medication.id)}
                        disabled={deleteMedication.isPending}
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
                      <PillBottle className="h-4 w-4 text-elevita-light-purple" />
                      <span className="text-gray-300">{medication.dosage}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-elevita-light-teal" />
                      <span className="text-gray-300">{medication.frequency}</span>
                    </div>
                    
                    {medication.prescribedBy && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-elevita-purple" />
                        <span className="text-gray-300">Dr. {medication.prescribedBy}</span>
                      </div>
                    )}
                    
                    {medication.purpose && (
                      <p className="text-sm text-gray-400 mt-2">
                        {medication.purpose}
                      </p>
                    )}
                    
                    {medication.startDate && (
                      <div className="text-xs text-gray-500 mt-3">
                        Started: {new Date(medication.startDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {medication.endDate && (
                      <div className="text-xs text-gray-500">
                        Ends: {new Date(medication.endDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-1 text-xs text-yellow-400 mb-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Side Effects</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.map((effect, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-yellow-400/20 text-yellow-300"
                            >
                              {effect}
                            </Badge>
                          ))}
                        </div>
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
