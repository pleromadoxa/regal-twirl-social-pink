
import { useNavigate } from 'react-router-dom';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Sparkles, Heart, Users, BookOpen, Star, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    console.log('Join Network button clicked, navigating to /auth');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto">
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(168, 85, 247)"
        gradientBackgroundEnd="rgb(109, 40, 217)"
        firstColor="168, 85, 247"
        secondColor="236, 72, 153"
        thirdColor="59, 130, 246"
        fourthColor="147, 51, 234"
        fifthColor="219, 39, 119"
        pointerColor="139, 92, 246"
      >
        <div className="absolute z-50 inset-0 flex flex-col items-center justify-start text-white font-bold px-4 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8 pointer-events-none min-h-screen overflow-y-auto">
          {/* Logo - Responsive Size */}
          <div className="mb-4 sm:mb-6 md:mb-8 pointer-events-auto flex-shrink-0">
            <div className="relative group">
              <img 
                src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                alt="Regal Network Logo" 
                className="h-20 sm:h-28 md:h-36 lg:h-44 w-auto mx-auto mb-2 sm:mb-4 md:mb-6 transition-transform group-hover:scale-110 filter drop-shadow-2xl"
              />
              <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Main heading - Responsive */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 flex-shrink-0">
            <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-300 animate-pulse" />
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/90 to-white/60">
                Welcome to
              </h1>
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-300 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-2 sm:mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Regal
              </span>
              <span className="text-white/90"> Network</span>
            </h2>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
                A Christian Social Network
              </p>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* Enter button - Moved up for better visibility */}
          <div className="pointer-events-auto mb-8 sm:mb-10 md:mb-12 flex-shrink-0">
            <InteractiveHoverButton
              text="Join the Network"
              onClick={handleEnterClick}
              className="w-40 sm:w-44 md:w-52 h-11 sm:h-12 md:h-14 text-sm sm:text-base font-bold bg-white/10 backdrop-blur-xl border-white/20 text-white hover:text-white shadow-2xl"
            />
          </div>

          {/* Features - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto mb-6 sm:mb-8 md:mb-10 text-center w-full px-2 sm:px-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto mb-2 sm:mb-3 group-hover:scale-125 transition-transform"></div>
              <Users className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 sm:mb-3 text-purple-300" />
              <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Faith Community</h3>
              <p className="text-white/70 text-xs sm:text-sm">Connect with believers worldwide in fellowship</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mx-auto mb-2 sm:mb-3 group-hover:scale-125 transition-transform"></div>
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 sm:mb-3 text-pink-300" />
              <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Share Your Testimony</h3>
              <p className="text-white/70 text-xs sm:text-sm">Inspire others with your faith journey</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mb-2 sm:mb-3 group-hover:scale-125 transition-transform"></div>
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 sm:mb-3 text-blue-300" />
              <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Biblical Resources</h3>
              <p className="text-white/70 text-xs sm:text-sm">Access devotions, prayers, and scripture</p>
            </div>
          </div>

          {/* Stats - Responsive */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center flex-shrink-0 mb-8">
            <div className="group">
              <div className="text-base sm:text-xl md:text-2xl font-bold text-purple-300 group-hover:scale-110 transition-transform">892K+</div>
              <div className="text-xs sm:text-sm text-white/70">Believers</div>
            </div>
            <div className="group">
              <div className="text-base sm:text-xl md:text-2xl font-bold text-pink-300 group-hover:scale-110 transition-transform">25K+</div>
              <div className="text-xs sm:text-sm text-white/70">Daily Posts</div>
            </div>
            <div className="group">
              <div className="text-base sm:text-xl md:text-2xl font-bold text-blue-300 group-hover:scale-110 transition-transform">150+</div>
              <div className="text-xs sm:text-sm text-white/70">Countries</div>
            </div>
          </div>
        </div>
      </BackgroundGradientAnimation>
      
      {/* Footer - Responsive */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="text-center py-2 sm:py-3 px-4 sm:px-6 bg-black/20 backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-white/70">
            © {new Date().getFullYear()} Regal Network Technologies. All rights reserved. Powered by Lovetap Technologies. Built with ♥️ for the Kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
