import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface MedicationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MedicationForm({ onClose, onSuccess }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    prescribedBy: "",
    purpose: "",
    startDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will be implemented when API is ready
    console.log("Medication form data:", formData);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-elevita-dark-gray border-elevita-medium-gray">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Add Medication</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Medication Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dosage" className="text-gray-300">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                placeholder="e.g., 10mg"
                required
              />
            </div>

            <div>
              <Label htmlFor="frequency" className="text-gray-300">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                placeholder="e.g., twice daily"
                required
              />
            </div>

            <div>
              <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-elevita-medium-gray text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-elevita-bright-teal hover:bg-elevita-teal text-black"
              >
                Add Medication
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}