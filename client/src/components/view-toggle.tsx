import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Stethoscope, ToggleLeft, ToggleRight } from "lucide-react";

export function ViewToggle() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isHealthcareProfessional = (user as any)?.isHealthcareProfessional;
  const currentView = (user as any)?.currentView || "patient";
  const [isToggling, setIsToggling] = useState(false);

  const switchViewMutation = useMutation({
    mutationFn: (newView: string) =>
      apiRequest("POST", "/api/user/switch-view", { currentView: newView }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsToggling(false);
      toast({
        title: "View switched",
        description: `Now viewing as ${currentView === "patient" ? "professional" : "patient"}`,
      });
    },
    onError: () => {
      setIsToggling(false);
      toast({
        title: "Error switching view",
        description: "Unable to switch views. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isHealthcareProfessional) {
    return null;
  }

  const handleToggle = () => {
    setIsToggling(true);
    const newView = currentView === "patient" ? "professional" : "patient";
    switchViewMutation.mutate(newView);
  };

  const isProfessionalView = currentView === "professional";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isToggling || switchViewMutation.isPending}
        className="flex items-center gap-2 h-8 px-3 rounded-full border border-border hover:bg-accent"
      >
        {isProfessionalView ? (
          <>
            <Stethoscope className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium">Professional</span>
            <ToggleRight className="h-4 w-4 text-primary" />
          </>
        ) : (
          <>
            <Heart className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Patient</span>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </Button>
      
      {isProfessionalView && (
        <Badge variant="secondary" className="text-xs py-1 px-2">
          Pro
        </Badge>
      )}
    </div>
  );
}