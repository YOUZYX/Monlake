import React from 'react';
import { motion } from 'framer-motion';

export const CoralReef: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
      {/* Coral formations */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${i * 12 + 5}%`,
            width: `${15 + Math.random() * 20}px`,
            height: `${30 + Math.random() * 40}px`,
          }}
          animate={{
            scaleY: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          {/* Coral body */}
          <div 
            className={`w-full h-full rounded-t-full ${
              i % 3 === 0 
                ? 'bg-gradient-to-t from-pink-600/40 to-pink-400/20' 
                : i % 3 === 1 
                ? 'bg-gradient-to-t from-orange-600/40 to-orange-400/20'
                : 'bg-gradient-to-t from-purple-600/40 to-purple-400/20'
            }`}
            style={{
              filter: 'blur(1px)',
            }}
          />
          
          {/* Coral polyps */}
          {[...Array(3)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + j * 30}%`,
                top: `${10 + j * 20}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: j * 0.5,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Seaweed */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`seaweed-${i}`}
          className="absolute bottom-0"
          style={{
            left: `${i * 20 + 10}%`,
            width: '3px',
            height: `${40 + Math.random() * 30}px`,
          }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-t from-green-700/60 to-green-500/30 rounded-t-lg"
            animate={{
              rotate: [0, 5, 0, -5, 0],
              scaleX: [1, 1.1, 1, 0.9, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              transformOrigin: 'bottom center',
              filter: 'blur(0.5px)',
            }}
          />
        </motion.div>
      ))}

      {/* Sand particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sand-${i}`}
          className="absolute bottom-0 w-1 h-1 bg-yellow-200/20 rounded-full"
          style={{
            left: `${i * 8 + 2}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Rocky formations */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`rock-${i}`}
          className="absolute bottom-0"
          style={{
            left: `${i * 25 + 15}%`,
            width: `${20 + Math.random() * 15}px`,
            height: `${15 + Math.random() * 10}px`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-gray-700/50 to-gray-500/30 rounded-t-lg opacity-40" />
        </motion.div>
      ))}
    </div>
  );
};
