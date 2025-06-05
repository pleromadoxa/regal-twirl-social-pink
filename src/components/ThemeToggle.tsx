
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-10 h-10 p-0 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-800 transition-all duration-300 group overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="relative w-6 h-6">
        <Sun className={`absolute inset-0 w-6 h-6 text-amber-600 transition-all duration-500 ${
          theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`} />
        <Moon className={`absolute inset-0 w-6 h-6 text-indigo-600 transition-all duration-500 ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
