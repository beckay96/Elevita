import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BasicProfileStepProps {
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function BasicProfileStep({ onNext, onBack, canGoBack }: BasicProfileStepProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [firstName, setFirstName] = useState((user as any)?.firstName || "");
  const [lastName, setLastName] = useState((user as any)?.lastName || "");

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) =>
      apiRequest("POST", "/api/setup/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onNext();
      toast({
        title: "Profile updated",
        description: "Your basic profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both first name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Let's personalize your Elevita experience with some basic information
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground font-medium">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="bg-background border-input text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="bg-background border-input text-foreground"
            required
          />
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">Privacy Note</p>
          <p>Your personal information is encrypted and only used to personalize your healthcare experience. You can update this information anytime.</p>
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
        <Button
          onClick={handleNext}
          disabled={updateProfileMutation.isPending}
          className="min-w-24"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}