import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Bell } from "lucide-react";
import elevitaLightModeLogo from "@assets/elevitaLightModeLogo.png";

export default function NavigationHeader() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", active: location === "/" },
    { path: "/timeline", label: "Health Timeline", active: location === "/timeline" },
    { path: "/medications", label: "Medications", active: location === "/medications" },
    { path: "/symptoms", label: "Symptoms", active: location === "/symptoms" },
    { path: "/reports", label: "Reports", active: location === "/reports" },
  ];

  return (
    <header className="bg-elevita-dark-gray/80 backdrop-blur-md border-b border-elevita-medium-gray/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src={elevitaLightModeLogo} 
              alt="Elevita Logo" 
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-bold text-white">Elevita</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`transition-colors cursor-pointer ${
                    item.active
                      ? "text-elevita-bright-teal"
                      : "text-gray-300 hover:text-elevita-bright-teal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-lg bg-elevita-medium-gray/50 hover:bg-elevita-medium-gray transition-colors"
            >
              <Bell className="h-4 w-4 text-elevita-bright-teal" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-teal flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U"}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-300 hover:text-white text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
