import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedEmojiProps {
  emoji: string;
  animation?: 'bounce' | 'pulse' | 'spin' | 'wiggle' | 'float' | 'grow' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const EMOJI_ANIMATIONS = {
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
  float: 'animate-[float_3s_ease-in-out_infinite]',
  grow: 'animate-[grow_2s_ease-in-out_infinite]',
  none: ''
};

const EMOJI_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl'
};

// Special animated emojis that get extra effects
const SPECIAL_EMOJIS = {
  '🎉': 'confetti',
  '✨': 'sparkle',
  '🔥': 'fire',
  '💫': 'dizzy',
  '⚡': 'lightning',
  '🌟': 'glow',
  '🎊': 'party',
  '💥': 'explosion'
};

export const AnimatedEmoji = ({ 
  emoji, 
  animation = 'none', 
  size = 'md', 
  className = '',
  onClick 
}: AnimatedEmojiProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  
  const isSpecialEmoji = emoji in SPECIAL_EMOJIS;
  const animationClass = EMOJI_ANIMATIONS[animation];
  const sizeClass = EMOJI_SIZES[size];

  const handleClick = () => {
    if (isSpecialEmoji) {
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1000);
    }
    onClick?.();
  };

  const getSpecialEffect = () => {
    const effectType = SPECIAL_EMOJIS[emoji as keyof typeof SPECIAL_EMOJIS];
    
    switch (effectType) {
      case 'confetti':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[confetti_1s_ease-out_forwards] opacity-0`}
                style={{
                  left: '50%',
                  top: '50%',
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 60}deg)`
                }}
              />
            ))}
          </div>
        );
      case 'sparkle':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-400 animate-[sparkle_0.8s_ease-out_forwards] opacity-0"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        );
      case 'glow':
        return (
          <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping pointer-events-none" />
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-block cursor-pointer transition-all duration-200 relative',
        sizeClass,
        animationClass,
        isHovered && 'scale-110',
        onClick && 'hover:scale-110',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {emoji}
      {showEffect && getSpecialEffect()}
    </span>
  );
};

// Emoji Rain Effect Component
export const EmojiRain = ({ 
  emoji = '🎉', 
  duration = 3000, 
  onComplete 
}: { 
  emoji?: string; 
  duration?: number; 
  onComplete?: () => void; 
}) => {
  const [drops, setDrops] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    const newDrops = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1000
    }));
    setDrops(newDrops);

    const timer = setTimeout(() => {
      setDrops([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute text-2xl animate-[fall_3s_linear_forwards]"
          style={{
            left: `${drop.left}%`,
            top: '-10%',
            animationDelay: `${drop.delay}ms`
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default AnimatedEmoji;