import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Heart, User, Stethoscope } from "lucide-react";

export function SetupCompleteStep() {
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getUserRoleInfo = () => {
    const userRole = (user as any)?.userRole;
    const isHealthcareProfessional = (user as any)?.isHealthcareProfessional;

    switch (userRole) {
      case "doctor":
        return { 
          title: "Doctor", 
          icon: Stethoscope, 
          color: "text-green-600 dark:text-green-400",
          features: ["Patient health tracking", "Professional clinical tools", "Advanced analytics", "Switch between patient/professional views"]
        };
      case "nurse":
        return { 
          title: "Nurse", 
          icon: Heart, 
          color: "text-purple-600 dark:text-purple-400",
          features: ["Personal health management", "Nursing-specific tools", "Patient care resources", "Professional networking"]
        };
      case "clinician":
        return { 
          title: "Healthcare Clinician", 
          icon: User, 
          color: "text-orange-600 dark:text-orange-400",
          features: ["Health tracking", "Clinical references", "Professional resources", "Specialized tools"]
        };
      default:
        return { 
          title: "Patient", 
          icon: Heart, 
          color: "text-blue-600 dark:text-blue-400",
          features: ["Medication tracking", "Symptom monitoring", "Appointment management", "Health insights"]
        };
    }
  };

  const roleInfo = getUserRoleInfo();
  const RoleIcon = roleInfo.icon;
  const firstName = (user as any)?.firstName || "there";

  const handleContinue = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Welcome to Elevita, {firstName}!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Your healthcare platform is ready to use
              </CardDescription>
            </div>
            <div className="flex justify-center">
              <Badge variant="secondary" className="flex items-center gap-2">
                <RoleIcon className={`h-4 w-4 ${roleInfo.color}`} />
                {roleInfo.title}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Your Platform Features:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roleInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {(user as any)?.isHealthcareProfessional && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-2">
                  Professional Features Enabled
                </h3>
                <p className="text-sm text-muted-foreground">
                  You can switch between patient and professional views anytime using the view toggle in your navigation menu.
                </p>
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Redirecting to your dashboard in a few seconds...
              </p>
              <Button 
                onClick={handleContinue}
                className="w-full max-w-xs mx-auto"
                size="lg"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}