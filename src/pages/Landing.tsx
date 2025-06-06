
import { useNavigate } from 'react-router-dom';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const Landing = () => {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    navigate('/auth');
  };

  return (
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
          <img 
            src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
            alt="Network Logo" 
            className="h-24 w-auto mx-auto mb-4"
          />
        </div>

        {/* Main heading */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6 bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/90 to-white/60">
            Welcome to
          </h1>
          <h2 className="text-5xl md:text-6xl lg:text-7xl mb-4">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Regal
            </span>
            <span className="text-white/90"> Network</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            The Royal Social Media Experience
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Connect Globally</h3>
            <p className="text-white/70 text-sm">Join millions sharing their royal stories</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-3 h-3 bg-pink-400 rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Express Yourself</h3>
            <p className="text-white/70 text-sm">Share your voice with powerful tools</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
            <p className="text-white/70 text-sm">Keep up with trends that matter</p>
          </div>
        </div>

        {/* Enter button */}
        <div className="pointer-events-auto">
          <InteractiveHoverButton
            text="Enter"
            onClick={handleEnterClick}
            className="w-48 h-14 text-lg font-bold bg-white/10 backdrop-blur-sm border-white/20 text-white hover:text-white"
          />
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Landing;
