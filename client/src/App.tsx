import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Medications from "@/pages/medications";
import Symptoms from "@/pages/symptoms";
import Timeline from "@/pages/timeline";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import SetupWizard from "@/components/setup-wizard";
import { CalendarPage } from "@/pages/calendar";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Check if setup is needed
  const needsSetup = isAuthenticated && user && !(user as any)?.setupCompleted;
  
  // Check if user is in professional view
  const isProfessionalView = (user as any)?.currentView === "professional";

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : needsSetup ? (
        <Route path="*" component={SetupWizard} />
      ) : (
        <>
          <Route path="/" component={isProfessionalView ? ProfessionalDashboard : Dashboard} />
          <Route path="/professional" component={ProfessionalDashboard} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/medications" component={Medications} />
          <Route path="/symptoms" component={Symptoms} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/landing" component={Landing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors">
            <Toaster />
          
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
