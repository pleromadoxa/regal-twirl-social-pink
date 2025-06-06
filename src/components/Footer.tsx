
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const { theme } = useTheme();
  
  // Get logo URLs from Supabase storage
  const getLightLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-light.png');
    return data.publicUrl;
  };

  const getDarkLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-dark.png');
    return data.publicUrl;
  };
  
  return (
    <footer className="border-t border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={theme === 'dark' ? getLightLogoUrl() : getDarkLogoUrl()}
            alt="Regal Network Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback to text if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('span');
              fallback.className = 'text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent';
              fallback.textContent = 'RN';
              target.parentNode?.appendChild(fallback);
            }}
          />
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Regal Network
          </span>
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
