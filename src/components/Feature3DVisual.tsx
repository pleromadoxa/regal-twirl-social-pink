import React from 'react';
import { motion } from 'framer-motion';

interface Feature3DVisualProps {
  featureId: string;
  color: string;
}

const Feature3DVisual: React.FC<Feature3DVisualProps> = ({ featureId, color }) => {
  const getVisual = () => {
    switch (featureId) {
      case 'circles':
        return (
          <div className="relative w-full h-48 flex items-center justify-center perspective-1000">
            <motion.div
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{ background: `linear-gradient(135deg, ${color})` }}
              animate={{
                scale: [1, 1.2, 1],
                rotateY: [0, 360],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-24 h-24 rounded-full opacity-40"
              style={{ background: `linear-gradient(135deg, ${color})` }}
              animate={{
                scale: [1, 1.3, 1],
                rotateY: [360, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full opacity-60"
              style={{ background: `linear-gradient(135deg, ${color})` }}
              animate={{
                scale: [1, 1.4, 1],
                rotateY: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case 'challenges':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className="relative w-32 h-40"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl opacity-80`} 
                   style={{ transform: "translateZ(20px)" }} />
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl opacity-60`} 
                   style={{ transform: "rotateY(90deg) translateZ(20px)" }} />
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl opacity-40`} 
                   style={{ transform: "rotateY(180deg) translateZ(20px)" }} />
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl opacity-20`} 
                   style={{ transform: "rotateY(270deg) translateZ(20px)" }} />
            </motion.div>
          </div>
        );

      case 'time-capsules':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className={`w-32 h-32 bg-gradient-to-br ${color} rounded-3xl`}
              animate={{
                rotateX: [0, 360],
                rotateZ: [0, 180],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            />
            <motion.div
              className="absolute w-20 h-20 border-4 border-current rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case 'mood-board':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-24 h-32 bg-gradient-to-br ${color} rounded-xl`}
                animate={{
                  rotateY: [i * 45, i * 45 + 360],
                  x: [0, Math.cos(i * Math.PI / 2) * 40, 0],
                  y: [0, Math.sin(i * Math.PI / 2) * 40, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                style={{ transformStyle: "preserve-3d", opacity: 0.3 + i * 0.15 }}
              />
            ))}
          </div>
        );

      case 'milestones':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className={`w-40 h-40 bg-gradient-to-br ${color} rounded-full`}
              animate={{
                scale: [1, 1.2, 1],
                rotateZ: [0, 360],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-24 h-24 border-4 border-current rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                rotate: -360,
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case 'events':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className={`w-32 h-40 bg-gradient-to-br ${color} rounded-2xl`}
              animate={{
                rotateX: [-20, 20, -20],
                rotateY: [-20, 20, -20],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            />
          </div>
        );

      case 'reels':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className={`w-24 h-40 bg-gradient-to-br ${color} rounded-3xl`}
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            />
            <motion.div
              className="absolute w-32 h-48 border-2 border-current rounded-3xl opacity-30"
              animate={{
                rotateY: [360, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case 'music':
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-4 h-24 bg-gradient-to-t ${color} rounded-full mx-1`}
                animate={{
                  scaleY: [1, 1.5, 0.5, 1.5, 1],
                  rotateX: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
                style={{ transformStyle: "preserve-3d", opacity: 0.4 + i * 0.15 }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              className={`w-32 h-32 bg-gradient-to-br ${color} rounded-2xl`}
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d" }}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-sm">
      {getVisual()}
    </div>
  );
};

export default Feature3DVisual;
