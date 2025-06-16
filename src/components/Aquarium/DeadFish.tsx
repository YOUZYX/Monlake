import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface DeadFishProps {
  id: string;
  x: number;
  y: number;
  onRemove: (id: string) => void;
}

export const DeadFish: React.FC<DeadFishProps> = ({ id, x, y, onRemove }) => {
  // Auto-remove after reaching bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      onRemove(id);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [id, onRemove]);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0.8, scale: 1, rotate: 0 }}
      animate={{ 
        y: [0, window.innerHeight],
        rotate: [0, 180, 360, 540],
        opacity: [0.8, 0.6, 0.3, 0]
      }}
      transition={{ 
        duration: 5, 
        ease: "easeIn",
        times: [0, 0.3, 0.7, 1]
      }}
    >
      {/* Dead fish body */}
      <div className="relative">
        <div className="w-16 h-10 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full opacity-60">
          {/* Fish details */}
          <div className="absolute right-2 top-2 w-2 h-2 bg-gray-300 rounded-full opacity-40" />
          <div className="absolute -right-2 top-1 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent opacity-60" />
        </div>
        
        {/* X eyes */}
        <div className="absolute left-3 top-1 text-red-400 text-xs font-bold">✗</div>
        <div className="absolute left-6 top-1 text-red-400 text-xs font-bold">✗</div>
        
        {/* Bubble trail */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gray-400/40 rounded-full"
            style={{
              left: `${8 + i * 2}px`,
              top: `-${5 + i * 3}px`,
            }}
            animate={{
              y: [-10, -30],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
