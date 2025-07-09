
import { useNavigate } from 'react-router-dom';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Sparkles, Heart, Users, BookOpen, Star, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen">
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
        <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none">
          {/* Logo */}
          <div className="mb-8 pointer-events-auto">
            <div className="relative group">
              <img 
                src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                alt="Regal Network Logo" 
                className="h-40 w-auto mx-auto mb-6 transition-transform group-hover:scale-110 filter drop-shadow-2xl"
              />
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              <h1 className="text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/90 to-white/60">
                Welcome to
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl mb-4">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Regal
              </span>
              <span className="text-white/90"> Network</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-red-400" />
              <p className="text-xl md:text-2xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
                Faith • Community • Connection
              </p>
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto mb-4 group-hover:scale-125 transition-transform"></div>
              <Users className="w-8 h-8 mx-auto mb-3 text-purple-300" />
              <h3 className="text-lg font-semibold mb-2">Faith Community</h3>
              <p className="text-white/70 text-sm">Connect with believers worldwide in fellowship</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mx-auto mb-4 group-hover:scale-125 transition-transform"></div>
              <Zap className="w-8 h-8 mx-auto mb-3 text-pink-300" />
              <h3 className="text-lg font-semibold mb-2">Share Your Testimony</h3>
              <p className="text-white/70 text-sm">Inspire others with your faith journey</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mb-4 group-hover:scale-125 transition-transform"></div>
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-300" />
              <h3 className="text-lg font-semibold mb-2">Biblical Resources</h3>
              <p className="text-white/70 text-sm">Access devotions, prayers, and scripture</p>
            </div>
          </div>

          {/* Enter button */}
          <div className="pointer-events-auto">
            <InteractiveHoverButton
              text="Join the Network"
              onClick={handleEnterClick}
              className="w-56 h-16 text-lg font-bold bg-white/10 backdrop-blur-xl border-white/20 text-white hover:text-white shadow-2xl"
            />
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold text-purple-300 group-hover:scale-110 transition-transform">2.1M+</div>
              <div className="text-sm text-white/70">Active Users</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-pink-300 group-hover:scale-110 transition-transform">50K+</div>
              <div className="text-sm text-white/70">Daily Posts</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-blue-300 group-hover:scale-110 transition-transform">180+</div>
              <div className="text-sm text-white/70">Countries</div>
            </div>
          </div>
        </div>
      </BackgroundGradientAnimation>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="text-center py-4 px-6 bg-black/20 backdrop-blur-sm">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Regal Network Technologies. All rights reserved. Powered by Lovetap Technologies. Built with ♥️ for the Kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
