import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { PillBottle, Plus, Clock, AlertCircle } from "lucide-react";
import type { Medication } from "@shared/schema";

export default function MedicationTracker() {
  const { data: medications, isLoading } = useQuery({
    queryKey: ["/api/medications"],
    retry: false,
  });

  const activeMedications = medications?.filter((med: Medication) => med.isActive) || [];

  const getAdherence = () => Math.floor(Math.random() * 20) + 80; // Mock adherence calculation

  return (
    <div>
      <Card className="bg-elevita-dark-gray/50 backdrop-blur-md border-elevita-medium-gray/20">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-white">Current Medications</CardTitle>
            <Link href="/medications">
              <Button size="sm" variant="ghost" className="text-elevita-bright-teal hover:text-elevita-teal">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-400">Loading medications...</p>
            </div>
          ) : activeMedications.length === 0 ? (
            <div className="text-center py-8">
              <PillBottle className="h-8 w-8 text-elevita-teal mx-auto mb-2" />
              <p className="text-gray-400 mb-2">No medications added</p>
              <Link href="/medications">
                <Button size="sm" className="bg-elevita-teal hover:opacity-90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMedications.slice(0, 3).map((medication: Medication) => {
                const adherence = getAdherence();
                const adherenceColor = adherence >= 95 ? "bg-elevita-bright-teal" : adherence >= 80 ? "bg-yellow-400" : "bg-red-500";
                
                return (
                  <div key={medication.id} className="bg-elevita-medium-gray/20 rounded-lg p-4 border-l-4 border-elevita-light-purple">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{medication.name}</h4>
                      <span className="text-elevita-bright-teal text-sm font-medium">{adherence}% adherence</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{medication.dosage} - {medication.frequency}</p>
                    
                    {medication.purpose && (
                      <p className="text-gray-400 text-xs mb-3">{medication.purpose}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, index) => (
                          <span 
                            key={index} 
                            className={`w-2 h-2 rounded-full ${
                              index < Math.floor(adherence / 25) ? "bg-elevita-bright-teal" : "bg-elevita-medium-gray"
                            }`}
                          ></span>
                        ))}
                      </div>
                      <div className="flex items-center text-elevita-bright-teal text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Next dose upcoming</span>
                      </div>
                    </div>
                    
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mt-2 flex items-center text-yellow-400 text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>{medication.sideEffects.length} side effect(s) noted</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {activeMedications.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/medications">
                    <Button size="sm" variant="ghost" className="text-elevita-bright-teal hover:text-elevita-teal text-xs">
                      View all {activeMedications.length} medications
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
