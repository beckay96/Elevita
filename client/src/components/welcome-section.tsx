import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

export default function WelcomeSection() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const firstName = user?.firstName || user?.email?.split('@')[0] || "there";

  return (
    <div className="mb-8">
      <div className="bg-gradient-light dark:bg-gradient-teal rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-glass-dark"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-teal-700 to-purple-700 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-teal-300 dark:to-purple-400 dark:bg-clip-text dark:text-transparent">{firstName}</span>
          </h2>
          <p className="text-black dark:text-gray-200 text-lg mb-4">
            Your health journey continues. Here's what's happening today.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 min-w-[160px]">
              <div className="text-teal-300 text-2xl font-bold">
                {stats?.daysTracking || 0}
              </div>
              <div className="text-gray-100 text-sm">Days tracking</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 min-w-[160px]">
              <div className="text-elevita-light-purple text-2xl font-bold">
                {stats?.medicationsActive || 0}
              </div>
              <div className="text-gray-100 text-sm">Active medications</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 min-w-[160px]">
              <div className="text-elevita-teal text-2xl font-bold">
                {stats?.upcomingAppointments || 0}
              </div>
              <div className="text-gray-100 text-sm">Upcoming appointments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
