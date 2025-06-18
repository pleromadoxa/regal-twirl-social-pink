
import { useTheme } from '@/contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="border-t border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/1c8fdda0-b186-484f-a4d2-052b7342178b.png"
            alt="Regal Network Logo" 
            className="h-12 w-auto"
          />
        </div>
        
        {/* Copyright */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          © {new Date().getFullYear()} Regal Network Technologies. All rights reserved. Powered by Lovetap Technologies. Built with ♥️ for the Kingdom.
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
