
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-500 group"
    >
      <div className="relative w-6 h-6">
        <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
          theme === 'dark' 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        } text-amber-500 group-hover:text-amber-600`} />
        <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
          theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        } text-indigo-400 group-hover:text-indigo-300`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
