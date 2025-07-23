import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ProfessionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLoading?: boolean;
}

const MEDICAL_SPECIALTIES = [
  "Cardiology", "Dermatology", "Emergency Medicine", "Family Medicine", 
  "Internal Medicine", "Neurology", "Oncology", "Orthopedics", 
  "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Other"
];

const NURSING_SPECIALTIES = [
  "Critical Care", "Emergency Nursing", "Pediatric Nursing", "Psychiatric Nursing",
  "Surgical Nursing", "Oncology Nursing", "Cardiac Nursing", "Community Health",
  "Nurse Practitioner", "Nurse Anesthetist", "Other"
];

const CLINICAL_SPECIALTIES = [
  "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Mental Health Counseling",
  "Clinical Psychology", "Social Work", "Nutritionist", "Pharmacy", "Other"
];

export function ProfessionalInfoStep({ onNext, onBack, canGoBack, isLoading }: ProfessionalInfoStepProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [licenseNumber, setLicenseNumber] = useState((user as any)?.licenseNumber || "");
  const [specialty, setSpecialty] = useState((user as any)?.specialty || "");
  const [institution, setInstitution] = useState((user as any)?.institution || "");
  const [yearsExperience, setYearsExperience] = useState((user as any)?.yearsExperience?.toString() || "");

  const updateProfessionalInfoMutation = useMutation({
    mutationFn: (data: { 
      licenseNumber?: string; 
      specialty?: string; 
      institution?: string; 
      yearsExperience?: number;
    }) =>
      apiRequest("POST", "/api/setup/professional", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onNext();
      toast({
        title: "Professional information saved",
        description: "Your healthcare credentials have been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save your professional information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSpecialtyOptions = () => {
    const userRole = (user as any)?.userRole;
    if (userRole === "doctor") return MEDICAL_SPECIALTIES;
    if (userRole === "nurse") return NURSING_SPECIALTIES;
    if (userRole === "clinician") return CLINICAL_SPECIALTIES;
    return [...MEDICAL_SPECIALTIES, ...NURSING_SPECIALTIES, ...CLINICAL_SPECIALTIES];
  };

  const handleNext = () => {
    const data: any = {};
    
    if (licenseNumber.trim()) data.licenseNumber = licenseNumber.trim();
    if (specialty) data.specialty = specialty;
    if (institution.trim()) data.institution = institution.trim();
    if (yearsExperience) {
      const years = parseInt(yearsExperience);
      if (!isNaN(years) && years >= 0) {
        data.yearsExperience = years;
      }
    }

    updateProfessionalInfoMutation.mutate(data);
  };

  const handleSkip = () => {
    updateProfessionalInfoMutation.mutate({});
  };

  const getUserRoleDisplay = () => {
    const userRole = (user as any)?.userRole;
    switch (userRole) {
      case "doctor": return "Doctor";
      case "nurse": return "Nurse";
      case "clinician": return "Healthcare Clinician";
      default: return "Healthcare Professional";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Badge variant="secondary" className="mb-2">
            {getUserRoleDisplay()}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Add your professional credentials to unlock advanced features
        </p>
        <p className="text-sm text-muted-foreground">
          All fields are optional and can be updated later
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="text-foreground font-medium">
            License Number
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Enter your professional license number"
            className="bg-background border-input text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty" className="text-foreground font-medium">
            Specialty
          </Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Select your specialty" />
            </SelectTrigger>
            <SelectContent>
              {getSpecialtyOptions().map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution" className="text-foreground font-medium">
            Current Institution/Practice
          </Label>
          <Input
            id="institution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Hospital, clinic, or practice name"
            className="bg-background border-input text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsExperience" className="text-foreground font-medium">
            Years of Experience
          </Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            max="50"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="Years in practice"
            className="bg-background border-input text-foreground"
          />
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">Professional Features</p>
          <ul className="text-xs space-y-1">
            <li>• Switch between patient and professional views</li>
            <li>• Access clinical tools and references</li>
            <li>• Enhanced health data analysis</li>
            <li>• Professional networking (coming soon)</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={updateProfessionalInfoMutation.isPending || isLoading}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleNext}
            disabled={updateProfessionalInfoMutation.isPending || isLoading}
            className="min-w-24"
          >
            {updateProfessionalInfoMutation.isPending || isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}