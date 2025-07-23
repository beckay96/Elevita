import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* This is the main trigger button. 
          - It's now a rounded-full circle.
          - It uses cn() to conditionally apply glowing shadow effects.
          - The glow color changes based on the current theme (yellow for light, cyan for dark).
          - The hover/active scale transforms from the NeonToggle are included.
        */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-300",
            "hover:scale-110 active:scale-95",
            theme === 'light' 
              ? "text-yellow-500 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30" 
              : "text-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
          )}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/* The dropdown panel is now styled to look more modern.
        - It has a semi-transparent, blurred background (backdrop-blur-sm).
        - The border is more subtle.
        - A faint glow is added in dark mode to match the button.
      */}
      <DropdownMenuContent 
        align="end"
        className="mt-2 bg-background/80 backdrop-blur-sm border-border/30 dark:shadow-lg dark:shadow-cyan-500/10"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer focus:bg-accent/50"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {/* The active indicator dot now has a glow */}
          {theme === "light" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />}
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer focus:bg-accent/50"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />}
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer focus:bg-accent/50"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_theme(colors.primary)]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}