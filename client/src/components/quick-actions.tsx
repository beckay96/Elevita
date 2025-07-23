import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, PillBottle, Calendar, FileText } from "lucide-react";
import MedicationForm from "./medication-form";
import SymptomForm from "./symptom-form";

export default function QuickActions() {
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);

  return (
    <>
      <div className="bg-elevita-dark-gray/50 backdrop-blur-md rounded-2xl p-6 border border-elevita-medium-gray/20">
        <h3 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => setShowSymptomForm(true)}
            className="flex flex-col items-center p-4 h-auto bg-elevita-medium-gray/30 hover:bg-elevita-teal/20 text-foreground border-0 transition-all duration-200 group"
            variant="outline"
          >
            <Plus className="h-6 w-6 text-elevita-bright-teal mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm group-hover:text-teal-800">Log Symptom</span>
          </Button>
          
          <Button
            onClick={() => setShowMedicationForm(true)}
            className="flex flex-col items-center p-4 h-auto bg-elevita-medium-gray/30 hover:bg-elevita-purple/20 text-foreground border-0 transition-all duration-200 group"
            variant="outline"
          >
            <PillBottle className="h-6 w-6 text-elevita-teal mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm group-hover:text-teal-800">Add Medication</span>
          </Button>
          
          <Button
            className="flex flex-col items-center p-4 h-auto bg-elevita-medium-gray/30 hover:bg-elevita-teal/20 text-foreground border-0 transition-all duration-200 group"
            variant="outline"
          >
            <Calendar className="h-6 w-6 text-elevita-teal mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm group-hover:text-teal-800">Book Appointment</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/reports'}
            className="flex flex-col items-center text-foreground p-4 h-auto bg-elevita-medium-gray/30 hover:text-white hover:bg-teal-900/90 border-0 transition-all duration-200 group"
            variant="outline"
          >
            <FileText className="h-6 w-6 text-elevita-purple mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm group-hover:text-teal-800">View Reports</span>
          </Button>
        </div>
      </div>

      <Dialog open={showMedicationForm} onOpenChange={setShowMedicationForm}>
        <DialogContent className="bg-elevita-dark-gray border-elevita-medium-gray/20 text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Medication</DialogTitle>
          </DialogHeader>
          <MedicationForm onSuccess={() => setShowMedicationForm(false)} onClose={() => setShowMedicationForm(false)}/>
        </DialogContent>
      </Dialog>

      <Dialog open={showSymptomForm} onOpenChange={setShowSymptomForm}>
        <DialogContent className="bg-elevita-dark-gray border-elevita-medium-gray/20 text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Log New Symptom</DialogTitle>
          </DialogHeader>
          <SymptomForm onSuccess={() => setShowSymptomForm(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
