
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
      className="relative w-10 h-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-300"
    >
      <Sun className={`h-5 w-5 transition-all duration-300 ${
        theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
      } text-yellow-500`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-300 ${
        theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
      } text-purple-300`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
