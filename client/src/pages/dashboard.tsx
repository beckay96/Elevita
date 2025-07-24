import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import WelcomeSection from "@/components/welcome-section";
import QuickActions from "@/components/quick-actions";
import HealthTimeline from "@/components/health-timeline";
import AiInsights from "@/components/ai-insights";
import MedicationTracker from "@/components/medication-tracker";
// Additional components will be added as needed
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Shield } from "lucide-react";
import AIChatPopup from "@/components/ai-chat-popup";
import { useState } from "react";



export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { user } = useAuth();
  const userInfo = user as any;
  const isHealthcareProfessional = userInfo?.isHealthcareProfessional;
  const isProfessionalView = userInfo?.isProfessionalView;
  const currentView = isHealthcareProfessional && isProfessionalView ? 'professional' : 'patient';

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div>
            <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Today's Reminders</h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reminders for today</p>
                  <p className="text-sm mt-2">Check back tomorrow or add a new medication to get started</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HealthTimeline />
        <AiInsights />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MedicationTracker />
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-6">Recent Symptoms</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>No symptoms logged yet</p>
              <p className="text-sm mt-2">Track symptoms to identify patterns</p>
            </div>
          </div>
        </div>
      </div>

      

      {/* Regulatory Footer */}
      <footer className="bg-card border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-primary text-sm mb-2">
              <Shield className="inline h-4 w-4 mr-2" />
              <strong>Important Medical Disclaimer</strong>
            </p>
            <p className="text-muted-foreground text-xs max-w-4xl mx-auto">
              Elevita is designed to help you organise and communicate your health information. This platform does not provide medical advice, diagnosis, or treatment recommendations. The AI insights are for informational purposes only and should never replace professional medical consultation. Always consult with qualified healthcare professionals for medical decisions. In case of medical emergency, contact your local emergency services immediately.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-xs text-muted-foreground/70">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
