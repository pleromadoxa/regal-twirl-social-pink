
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
    sm: { container: 'w-8 h-8', text: 'text-sm', mainText: 'text-lg', subText: 'text-xs' },
    md: { container: 'w-12 h-12', text: 'text-lg', mainText: 'text-2xl', subText: 'text-sm' },
    lg: { container: 'w-16 h-16', text: 'text-xl', mainText: 'text-3xl', subText: 'text-base' },
    xl: { container: 'w-24 h-24', text: 'text-3xl', mainText: 'text-5xl', subText: 'text-lg' }
  };

  const { container, text, mainText, subText } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Logo Icon - Big in the middle */}
      <div className={`${container} relative flex items-center justify-center mb-3`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative">
            <span className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${text}`}>
              R
            </span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Text - Regal Network on next line, slogan on next line */}
      {showText && (
        <div className="flex flex-col items-center space-y-1">
          <h1 className={`font-bold text-purple-600 leading-tight ${mainText}`}>
            Regal Network
          </h1>
          <p className={`text-gray-500 leading-tight ${subText}`}>
            A Christian Social Network
          </p>
        </div>
      )}
    </div>
  );
};

export default RegalLogo;
