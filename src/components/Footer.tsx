
import { useTheme } from '@/contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="border-t border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={theme === 'dark' ? "/lovable-uploads/b4c5e1b1-b654-4fb8-8b85-ec33a9c87b0f.png" : "/lovable-uploads/0ed82dd9-3b2e-4688-a5e8-7f5b11e8a893.png"}
            alt="Regal Network Logo" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Regal Network
          </span>
        </div>
        
        {/* Copyright */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          © {new Date().getFullYear()} Regal Network. All rights reserved.
        </p>
        
        {/* Links */}
        <div className="flex space-x-6 text-sm">
          <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
