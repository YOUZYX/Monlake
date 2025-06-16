import React from 'react';
import { motion } from 'framer-motion';

export const WaterEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Enhanced main water gradient overlay */}
      <motion.div 
        className="water-effect"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Enhanced animated water layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.15), transparent, rgba(6, 182, 212, 0.15))'
        }}
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(-45deg, rgba(107, 70, 193, 0.1), transparent, rgba(59, 130, 246, 0.1))'
        }}
        animate={{
          x: [100, -100, 100],
          y: [50, -50, 50],
          scale: [1.05, 1, 1.05],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Enhanced light rays with caustic effects */}
      <motion.div 
        className="absolute top-0 left-1/4 w-2 h-full opacity-20 transform rotate-12"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 150, 0.4), transparent 70%)',
          filter: 'blur(1px)'
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute top-0 right-1/4 w-2 h-full opacity-15 transform -rotate-12"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 150, 0.3), transparent 60%)',
          filter: 'blur(1px)'
        }}
        animate={{
          opacity: [0.05, 0.25, 0.05],
          scaleX: [1, 1.3, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Enhanced floating particles with varied sizes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${5 + i * 4.5}%`,
            top: `${10 + (i % 5) * 15}%`,
            background: i % 3 === 0 
              ? 'rgba(255, 255, 255, 0.4)'
              : i % 3 === 1 
              ? 'rgba(59, 130, 246, 0.3)'
              : 'rgba(6, 182, 212, 0.3)',
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle surface waves */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent)',
          filter: 'blur(2px)',
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};