import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '../../utils/soundManager';

interface JellyfishProps {
  id: string;
  x: number;
  y: number;
  transactionHash?: string;
  onRemove: (id: string) => void;
}

export const Jellyfish: React.FC<JellyfishProps> = ({ id, x, y, transactionHash, onRemove }) => {
  const [phase, setPhase] = useState<'falling' | 'resting' | 'fading'>('falling');

  useEffect(() => {
    // Play jellyfish spawn sound when created
    soundManager.play('jellyfish_spawn');

    // Phase 1: Fall to bottom (6 seconds - much slower fall)
    const fallTimer = setTimeout(() => {
      setPhase('resting');
    }, 6000);

    // Phase 2: Rest at bottom (10 seconds - longer rest)
    const restTimer = setTimeout(() => {
      setPhase('fading');
    }, 16000); // 6s fall + 10s rest

    // Phase 3: Fade and remove (1 second)
    const removeTimer = setTimeout(() => {
      onRemove(id);
    }, 17000); // Total 17 seconds lifespan

    return () => {
      clearTimeout(fallTimer);
      clearTimeout(restTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  const handleClick = () => {
    if (transactionHash) {
      window.open(`https://testnet.monadexplorer.com/tx/${transactionHash}`, '_blank');
    }
  };

  const getPhaseAnimation = () => {
    switch (phase) {
      case 'falling':
        return {
          y: [0, window.innerHeight - 350],
          opacity: [0.9, 0.9],
          scale: [1, 1],
        };
      case 'resting':
        return {
          y: window.innerHeight - 350,
          opacity: [0.9, 0.9],
          scale: [1, 1.05, 1],
        };
      case 'fading':
        return {
          y: window.innerHeight - 350,
          opacity: [0.9, 0],
          scale: [1, 0.8],
        };
      default:
        return {};
    }
  };

  const getTransitionConfig = () => {
    switch (phase) {
      case 'falling':
        return { duration: 6, ease: "easeInOut" }; // Much slower, smoother fall
      case 'resting':
        return { duration: 5, repeat: Infinity, ease: "easeInOut" };
      case 'fading':
        return { duration: 1, ease: "easeOut" };
      default:
        return { duration: 1 };
    }
  };

  return (
    <motion.div
      className={`absolute ${transactionHash ? 'cursor-pointer' : 'pointer-events-none'}`}
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        ...getPhaseAnimation(),
        opacity: phase === 'fading' ? 0 : 0.9,
      }}
      transition={getTransitionConfig()}
      onClick={handleClick}
      whileHover={transactionHash ? { scale: 1.1 } : {}}
    >
      {/* Enhanced Jellyfish body - much more visible */}
      <motion.div
        className="relative"
        animate={{
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Main Bell - much more opaque and larger */}
        <div className="w-16 h-12 bg-gradient-to-b from-red-500/90 to-red-700/80 rounded-full shadow-2xl border-2 border-red-400/60 relative">
          <div className="absolute inset-2 bg-gradient-to-b from-red-300/60 to-transparent rounded-full" />
          
          {/* Glowing rim effect */}
          <div className="absolute inset-0 rounded-full border-2 border-red-300/40 shadow-lg shadow-red-500/50" />
        </div>
        
        {/* Enhanced Tentacles - more visible */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-10 bg-gradient-to-b from-red-500/80 to-red-700/60 rounded-full shadow-lg"
            style={{
              left: `${2 + i * 1.8}px`,
              width: '3px',
              height: `${12 + Math.random() * 8}px`,
              transformOrigin: 'top center'
            }}
            animate={{
              scaleY: [1, 1.4, 0.8, 1],
              x: [0, Math.sin(i) * 3, 0],
              rotate: [0, Math.sin(i) * 10, 0],
            }}
            transition={{
              duration: 1.5 + Math.random() * 0.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}

        {/* Pulsing spots for more definition */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`spot-${i}`}
            className="absolute w-2 h-2 bg-red-300/70 rounded-full"
            style={{
              left: `${4 + i * 4}px`,
              top: `${3 + i * 2}px`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Failed transaction indicator - more prominent */}
      <motion.div
        className="absolute -top-3 -right-3 text-red-300 text-lg font-bold bg-red-900/60 rounded-full w-6 h-6 flex items-center justify-center border border-red-400/50"
        animate={{ 
          opacity: phase === 'fading' ? [1, 0] : [1, 0.5, 1],
          scale: phase === 'resting' ? [1, 1.1, 1] : 1,
        }}
        transition={{ 
          duration: phase === 'fading' ? 1 : 1.5, 
          repeat: phase === 'fading' ? 0 : Infinity 
        }}
      >
        ✗
      </motion.div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150 pointer-events-none" />
    </motion.div>
  );
};
