
import React from 'react';

interface RegalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const RegalLogo: React.FC<RegalLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-lg' },
    lg: { container: 'w-16 h-16', text: 'text-xl' },
    xl: { container: 'w-24 h-24', text: 'text-3xl' }
  };

  const { container, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${container} relative flex items-center justify-center`}>
        {/* Background Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg"></div>
        
        {/* Inner Design */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Main R Letter */}
          <div className="relative">
            <span className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${text}`}>
              R
            </span>
            {/* Small accent dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-purple-600 leading-tight">Regal Network</span>
          <span className="text-xs text-gray-500 leading-tight">A Global Christian Social Network</span>
        </div>
      )}
    </div>
  );
};

export default RegalLogo;
