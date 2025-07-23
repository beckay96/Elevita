import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Stethoscope, UserCog, Users } from "lucide-react";

interface RoleSelectionStepProps {
  onNext: (role: string, isHealthcareProfessional: boolean) => void;
  onBack: () => void;
  canGoBack: boolean;
}

const USER_ROLES = [
  {
    id: "patient",
    title: "Patient",
    description: "I want to track my health, medications, and connect with healthcare providers",
    icon: Heart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    isHealthcareProfessional: false,
  },
  {
    id: "doctor",
    title: "Doctor",
    description: "I'm a physician who will also use this platform for my own health tracking",
    icon: Stethoscope,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    isHealthcareProfessional: true,
  },
  {
    id: "nurse",
    title: "Nurse",
    description: "I'm a registered nurse who wants to manage my personal health data",
    icon: UserCog,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    isHealthcareProfessional: true,
  },
  {
    id: "clinician",
    title: "Healthcare Clinician",
    description: "I'm a healthcare professional (therapist, specialist, etc.) tracking my health",
    icon: Users,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    isHealthcareProfessional: true,
  },
];

export function RoleSelectionStep({ onNext, onBack, canGoBack }: RoleSelectionStepProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: (data: { userRole: string; isHealthcareProfessional: boolean }) =>
      apiRequest("POST", "/api/setup/role", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      const role = USER_ROLES.find(r => r.id === selectedRole);
      if (role) {
        onNext(selectedRole, role.isHealthcareProfessional);
      }
      toast({
        title: "Role selected",
        description: "Your account type has been set successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save your role selection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleNext = () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose how you plan to use Elevita.",
        variant: "destructive",
      });
      return;
    }

    const role = USER_ROLES.find(r => r.id === selectedRole);
    if (role) {
      updateRoleMutation.mutate({
        userRole: selectedRole,
        isHealthcareProfessional: role.isHealthcareProfessional,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          All healthcare professionals are also patients and can switch between views
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USER_ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? `${role.borderColor} ring-2 ring-primary ring-offset-2 ring-offset-background`
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${role.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`h-6 w-6 ${role.color}`} />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  {role.title}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {role.description}
                </CardDescription>
                {role.isHealthcareProfessional && (
                  <div className="mt-3 text-xs text-primary font-medium">
                    ✓ Professional features included
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedRole || updateRoleMutation.isPending}
          className="min-w-24"
        >
          {updateRoleMutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}