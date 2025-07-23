import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/theme-context";
import { Bell, ChevronDown, Home, Calendar, Pill, Activity, FileText, Sun, Moon, Monitor, LogOut, Plus, Settings } from "lucide-react";
import { ViewToggle } from "@/components/view-toggle";
import AIChatPopup from "@/components/ai-chat-popup";
import NotificationPopup from "@/components/notification-popup";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import elevitaLightModeLogo from "@assets/elevitaLightModeLogo.png";
import elevitaDarkModeLogo from "@assets/elevitaDarkModeLogo.png";

export default function NavigationHeader() {
  const { user } = useAuth();
  const { actualTheme, theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Determine current view based on user type and toggle state
  const userInfo = user as any;
  const isHealthcareProfessional = userInfo?.isHealthcareProfessional;
  const isProfessionalView = userInfo?.isProfessionalView;
  const currentView = isHealthcareProfessional && isProfessionalView ? 'professional' : 'patient';

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/timeline", label: "Health Timeline", icon: Calendar },
    { path: "/medications", label: "Medications", icon: Pill },
    { path: "/symptoms", label: "Symptoms", icon: Activity },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
              <img 
                src={actualTheme === 'dark' ? elevitaDarkModeLogo : elevitaLightModeLogo} 
                alt="Elevita Logo" 
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-bold text-foreground">Elevita</h1>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ViewToggle />
            
            {/* AI Chat Button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-200/20 dark:border-purple-700/30"
              onClick={() => setIsAIChatOpen(true)}
            >
              <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </Button>
            
            <NotificationPopup />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      className={`cursor-pointer ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                      asChild
                    >
                      <Link href={item.path}>
                        <div className="flex items-center space-x-2 w-full">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                
                <DropdownMenuSeparator />
                
                {/* Theme Toggle Section */}
                <DropdownMenuItem 
                  onClick={() => setTheme("light")}
                  className="cursor-pointer"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                  {theme === "light" && <div className="ml-auto h-1 w-1 rounded-full bg-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme("dark")}
                  className="cursor-pointer"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                  {theme === "dark" && <div className="ml-auto h-1 w-1 rounded-full bg-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme("system")}
                  className="cursor-pointer"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {theme === "system" && <div className="ml-auto h-1 w-1 rounded-full bg-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Sign Out Section */}
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* AI Chat Popup */}
      <AIChatPopup 
        isOpen={isAIChatOpen}
        onOpenChange={setIsAIChatOpen}
        currentView={currentView}
      />
    </header>
  );
}
