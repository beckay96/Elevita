import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import HealthTimeline from "@/components/health-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, Filter, TrendingUp } from "lucide-react";

export default function TimelinePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development and will be available soon.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Timeline</h1>
              <p className="text-muted-foreground">
                Comprehensive view of your health journey and patterns
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={showComingSoonToast}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-xs" onClick={showComingSoonToast}>
                Advanced Filters
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={showComingSoonToast}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-xs" onClick={showComingSoonToast}>
                View Patterns
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={showComingSoonToast}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-xs" onClick={showComingSoonToast}>
                Download Data
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={showComingSoonToast}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-xs" onClick={showComingSoonToast}>
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Full Timeline Component */}
        <HealthTimeline showFullTimeline={true} />
      </div>
    </div>
  );
}