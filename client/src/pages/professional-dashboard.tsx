import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Mic, FileText, Users, Calendar, Clock, TrendingUp, Activity } from "lucide-react";
import ElevitaEars from "@/components/elevita-ears";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const userRole = (user as any)?.userRole;
  const specialty = (user as any)?.specialty;
  const institution = (user as any)?.institution;

  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development and will be available soon.",
      duration: 3000,
    });
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case "doctor": return "Doctor Dashboard";
      case "nurse": return "Nurse Dashboard";
      case "clinician": return "Clinician Dashboard";
      default: return "Healthcare Professional Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{getRoleTitle()}</h1>
              <p className="text-muted-foreground">
                Professional tools and patient management
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
            </Badge>
            {specialty && (
              <Badge variant="outline">
                {specialty}
              </Badge>
            )}
            {institution && (
              <Badge variant="outline">
                {institution}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Elevita's Ears - Primary Feature */}
          <div className="lg:col-span-2">
            <ElevitaEars />
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Today's Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Appointments</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transcriptions</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Reports</span>
                  <span className="font-semibold">2</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
                  <FileText className="mr-2 h-4 w-4" />
                  View All Transcriptions
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
                  <Users className="mr-2 h-4 w-4" />
                  Patient Records
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
                  <Activity className="mr-2 h-4 w-4" />
                  Analytics Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient consultation transcribed</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Treatment plan updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up scheduled</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={showComingSoonToast}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Patient Management
              </CardTitle>
              <CardDescription>
                Comprehensive patient records and care coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full" onClick={showComingSoonToast}>
                Access Patient Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={showComingSoonToast}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Clinical Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends from your practice data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full" onClick={showComingSoonToast}>
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={showComingSoonToast}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Schedule Management
              </CardTitle>
              <CardDescription>
                Appointment scheduling and calendar integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full" onClick={showComingSoonToast}>
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}