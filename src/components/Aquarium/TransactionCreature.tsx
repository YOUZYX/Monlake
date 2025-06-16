import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TransactionType } from '../../types';

interface TransactionCreatureProps {
  id: string;
  x: number;
  y: number;
  type: TransactionType;
  onRemove: (id: string) => void;
}

export const TransactionCreature: React.FC<TransactionCreatureProps> = ({ 
  id, x, y, type, onRemove 
}) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onRemove(id);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [id, onRemove]);

  const getCreatureConfig = () => {
    switch (type) {
      case 'swap':
        return {
          emoji: '🔄',
          color: 'from-yellow-400 to-orange-500',
          animation: { rotate: [0, 360], scale: [1, 1.2, 1] },
          trail: '💫'
        };
      case 'mint':
        return {
          emoji: '🎨',
          color: 'from-green-400 to-emerald-500',
          animation: { scale: [1, 1.3, 1], y: [0, -10, 0] },
          trail: '✨'
        };
      case 'contract':
        return {
          emoji: '⚡',
          color: 'from-purple-400 to-violet-500',
          animation: { 
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            x: [0, 10, -10, 0]
          },
          trail: '🔮'
        };
      case 'transfer':
        return {
          emoji: '💎',
          color: 'from-blue-400 to-cyan-500',
          animation: { 
            x: [0, 20, -10, 15, 0],
            y: [0, -5, 5, 0]
          },
          trail: '💫'
        };
      default:
        return {
          emoji: '🐠',
          color: 'from-monad-blue to-monad-purple',
          animation: { scale: [1, 1.1, 1] },
          trail: '🌊'
        };
    }
  };

  const config = getCreatureConfig();

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5],
        ...config.animation
      }}
      transition={{ 
        duration: 8, 
        ease: "easeInOut",
        times: [0, 0.1, 0.8, 1]
      }}
    >
      {/* Main creature body */}
      <motion.div
        className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-full shadow-lg flex items-center justify-center text-lg border border-white/20`}
        animate={config.animation}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-white text-shadow">{config.emoji}</span>
      </motion.div>

      {/* Particle trail */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-sm"
          style={{
            left: `${-5 + i * -8}px`,
            top: `${6 + Math.sin(i) * 4}px`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.3],
            x: [0, -20],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        >
          {config.trail}
        </motion.div>
      ))}

      {/* Type indicator */}
      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, times: [0, 0.2, 0.8, 1] }}
      >
        {type.toUpperCase()}
      </motion.div>
    </motion.div>
  );
};
