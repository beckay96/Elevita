import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import WelcomeSection from "@/components/welcome-section";
import QuickActions from "@/components/quick-actions";
import HealthTimeline from "@/components/health-timeline";
import AiInsights from "@/components/ai-insights";
import MedicationTracker from "@/components/medication-tracker";
import SymptomTracker from "@/components/symptom-tracker";
import ClinicalTranslator from "@/components/clinical-translator";
import ExportSharing from "@/components/export-sharing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Shield } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
      <div className="min-h-screen bg-elevita-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-elevita-black">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div>
            <div className="bg-elevita-dark-gray/50 backdrop-blur-md rounded-2xl p-6 border border-elevita-medium-gray/20">
              <h3 className="text-xl font-semibold text-white mb-6">Today's Reminders</h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-400">
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
          <SymptomTracker />
        </div>
        
        <ClinicalTranslator />
        <ExportSharing />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          className="w-14 h-14 bg-gradient-teal rounded-full shadow-2xl text-white hover:scale-105 transition-transform duration-200 p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Regulatory Footer */}
      <footer className="bg-elevita-dark-gray border-t border-elevita-medium-gray/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-elevita-bright-teal text-sm mb-2">
              <Shield className="inline h-4 w-4 mr-2" />
              <strong>Important Medical Disclaimer</strong>
            </p>
            <p className="text-gray-400 text-xs max-w-4xl mx-auto">
              Elevita is designed to help you organize and communicate your health information. This platform does not provide medical advice, diagnosis, or treatment recommendations. The AI insights are for informational purposes only and should never replace professional medical consultation. Always consult with qualified healthcare professionals for medical decisions. In case of medical emergency, contact your local emergency services immediately.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-elevita-bright-teal">Privacy Policy</a>
              <a href="#" className="hover:text-elevita-bright-teal">Terms of Service</a>
              <a href="#" className="hover:text-elevita-bright-teal">HIPAA Compliance</a>
              <a href="#" className="hover:text-elevita-bright-teal">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
