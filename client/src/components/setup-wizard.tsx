import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoleSelectionStep } from "./setup-wizard/role-selection-step";
import { BasicProfileStep } from "./setup-wizard/basic-profile-step";
import { ProfessionalInfoStep } from "./setup-wizard/professional-info-step";
import { SetupCompleteStep } from "./setup-wizard/setup-complete-step";
import { CheckCircle2, User, UserCheck, Star } from "lucide-react";

const STEPS = [
  { id: 1, title: "Choose Your Role", icon: User, description: "Tell us how you'll use Elevita" },
  { id: 2, title: "Basic Profile", icon: UserCheck, description: "Set up your personal information" },
  { id: 3, title: "Professional Info", icon: Star, description: "Add your healthcare credentials" },
  { id: 4, title: "Complete", icon: CheckCircle2, description: "You're all set!" }
];

export default function SetupWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState((user as any)?.setupStep || 0);
  const [isHealthcareProfessional, setIsHealthcareProfessional] = useState(false);

  const completeSetupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/setup/complete"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCurrentStep(4);
    },
  });

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onRoleSelected = (role: string, isProfessional: boolean) => {
    setIsHealthcareProfessional(isProfessional);
    nextStep();
  };

  const onProfileCompleted = () => {
    if (isHealthcareProfessional) {
      nextStep(); // Go to professional info step
    } else {
      // Skip professional info step for patients
      completeSetupMutation.mutate();
    }
  };

  const onProfessionalInfoCompleted = () => {
    completeSetupMutation.mutate();
  };

  const getStepProgress = () => {
    return (currentStep / 4) * 100;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
      case 1:
        return (
          <RoleSelectionStep
            onNext={onRoleSelected}
            onBack={prevStep}
            canGoBack={false}
          />
        );
      case 2:
        return (
          <BasicProfileStep
            onNext={onProfileCompleted}
            onBack={prevStep}
            canGoBack={true}
          />
        );
      case 3:
        return (
          <ProfessionalInfoStep
            onNext={onProfessionalInfoCompleted}
            onBack={prevStep}
            canGoBack={true}
            isLoading={completeSetupMutation.isPending}
          />
        );
      case 4:
        return <SetupCompleteStep />;
      default:
        return null;
    }
  };

  if (currentStep === 4) {
    return <SetupCompleteStep />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Elevita</h1>
          <p className="text-lg text-muted-foreground">
            Let's set up your healthcare platform experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isAccessible = step.id <= Math.max(currentStep, 1);

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    !isAccessible ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {STEPS.find(s => s.id === Math.max(currentStep, 1))?.title}
            </CardTitle>
            <CardDescription>
              {STEPS.find(s => s.id === Math.max(currentStep, 1))?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}