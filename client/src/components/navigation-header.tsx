import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/theme-context";
import { Heart, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import elevitaLightModeLogo from "@assets/elevitaLightModeLogo.png";
import elevitaDarkModeLogo from "@assets/elevitaDarkModeLogo.png";

export default function NavigationHeader() {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", active: location === "/" },
    { path: "/timeline", label: "Health Timeline", active: location === "/timeline" },
    { path: "/medications", label: "Medications", active: location === "/medications" },
    { path: "/symptoms", label: "Symptoms", active: location === "/symptoms" },
    { path: "/reports", label: "Reports", active: location === "/reports" },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center space-x-4">
            <img 
              src={actualTheme === 'dark' ? elevitaDarkModeLogo : elevitaLightModeLogo} 
              alt="Elevita Logo" 
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-bold text-foreground">Elevita</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`transition-colors cursor-pointer ${
                    item.active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 w-9 rounded-lg"
            >
              <Bell className="h-4 w-4 text-primary" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground">
                  {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U"}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-muted-foreground hover:text-foreground text-sm"
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
