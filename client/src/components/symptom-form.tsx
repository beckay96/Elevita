import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface SymptomFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SymptomForm({ onClose, onSuccess }: SymptomFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    severity: "",
    location: "",
    duration: "",
    notes: "",
    occurredAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will be implemented when API is ready
    console.log("Symptom form data:", formData);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-elevita-dark-gray border-elevita-medium-gray">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Log Symptom</CardTitle>
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
              <Label htmlFor="name" className="text-gray-300">Symptom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                placeholder="e.g., Headache"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="severity" className="text-gray-300">Severity (1-10)</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                <SelectTrigger className="bg-elevita-medium-gray border-elevita-medium-gray text-white">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-elevita-dark-gray border-elevita-medium-gray">
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} {i === 0 ? "(Mild)" : i === 4 ? "(Moderate)" : i === 9 ? "(Severe)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-gray-300">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                placeholder="e.g., Left temple"
              />
            </div>

            <div>
              <Label htmlFor="occurredAt" className="text-gray-300">When did it occur?</Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={formData.occurredAt}
                onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-300">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-elevita-medium-gray border-elevita-medium-gray text-white"
                placeholder="Additional details..."
                rows={3}
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
                Log Symptom
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}