import React from 'react';
import { motion } from 'framer-motion';
import { TransactionType } from '../../types';

interface TreasureChestProps {
  type: TransactionType;
  count: number;
  position: number; // 0-4 for 5 chests
}

export const TreasureChest: React.FC<TreasureChestProps> = ({ type, count, position }) => {
  const getChestConfig = () => {
    switch (type) {
      case 'transfer':
        return {
          emoji: '💎',
          name: 'Transfers',
          color: 'from-blue-600 to-cyan-500',
          gemColor: 'bg-blue-400',
          bubbleColor: 'border-blue-400 bg-blue-500/20'
        };
      case 'swap':
        return {
          emoji: '🔄',
          name: 'DEX Swaps',
          color: 'from-yellow-600 to-orange-500',
          gemColor: 'bg-yellow-400',
          bubbleColor: 'border-yellow-400 bg-yellow-500/20'
        };
      case 'mint':
        return {
          emoji: '🎨',
          name: 'NFT Mints',
          color: 'from-green-600 to-emerald-500',
          gemColor: 'bg-green-400',
          bubbleColor: 'border-green-400 bg-green-500/20'
        };
      case 'contract':
        return {
          emoji: '⚡',
          name: 'Contracts',
          color: 'from-purple-600 to-violet-500',
          gemColor: 'bg-purple-400',
          bubbleColor: 'border-purple-400 bg-purple-500/20'
        };      case 'failed':
        return {
          emoji: '☠️',
          name: 'Failed TX',
          color: 'from-red-800 to-red-700',
          gemColor: 'bg-red-600',
          bubbleColor: 'border-red-500 bg-red-700/30',
          destroyed: true
        };
      case 'other':
        return {
          emoji: '🧩',
          name: 'Other TX',
          color: 'from-gray-600 to-teal-700',
          gemColor: 'bg-teal-400',
          bubbleColor: 'border-teal-400 bg-teal-500/20'
        };
      default:
        return {
          emoji: '📦',
          name: 'Other',
          color: 'from-gray-600 to-gray-500',
          gemColor: 'bg-gray-400',
          bubbleColor: 'border-gray-400 bg-gray-500/20'
        };
    }
  };

  const config = getChestConfig();
  // Adjusted for 6 chests: spread evenly from 8% to 92%
  const totalChests = 6;
  const minLeft = 8; // percent
  const maxLeft = 92; // percent
  const leftPosition = minLeft + ((maxLeft - minLeft) / (totalChests - 1)) * position; // Spread 5 chests across bottom

  return (
    <div
      className="absolute bottom-8 transform -translate-x-1/2"
      style={{ left: `${leftPosition}%` }}
    >
      {/* Counter Bubble */}
      <motion.div
        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full border-2 ${config.bubbleColor} backdrop-blur-sm text-white text-xs font-bold min-w-[40px] text-center`}
        animate={{
          scale: count > 0 ? [1, 1.1, 1] : 1,
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        key={count} // Re-animate when count changes
      >
        {count}
      </motion.div>      {/* Treasure Chest */}
      <motion.div
        className={`relative cursor-pointer ${config.destroyed ? 'opacity-80' : ''}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -1, 0],
          rotate: config.destroyed ? [-1, 2, -1] : 0,
        }}
        transition={{
          duration: 3 + position * 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >        {/* Chest Base */}
        <div className={`w-14 h-10 bg-gradient-to-b ${config.color} rounded-lg shadow-xl border-2 ${config.destroyed ? 'border-gray-700/70' : 'border-amber-600/50'} relative overflow-hidden`}>
          {/* Chest Lid */}
          <motion.div
            className={`absolute top-0 left-0 right-0 h-4 bg-gradient-to-b ${config.color} rounded-t-lg border-b-2 ${config.destroyed ? 'border-gray-800/80' : 'border-amber-700/60'}`}
            animate={{
              rotateX: count > 0 ? [0, 15, 0] : 0,
              rotateZ: config.destroyed ? -5 : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: 'bottom' }}
          >
            {/* Lock */}
            <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${config.destroyed ? 'bg-gray-600 border-gray-700' : 'bg-amber-400 border border-amber-600'} rounded-sm`} />
            
            {/* Cracks in lid for destroyed chest */}
            {config.destroyed && (
              <>
                <div className="absolute top-1 left-1 w-3 h-0.5 bg-gray-900/80 rotate-45" />
                <div className="absolute top-2 right-2 w-4 h-0.5 bg-gray-900/80 -rotate-30" />
              </>
            )}
          </motion.div>

          {/* Chest Body Details */}
          <div className={`absolute bottom-1 left-1 right-1 h-6 bg-gradient-to-t ${config.destroyed ? 'from-gray-900/50' : 'from-amber-700/30'} to-transparent rounded`} />
          
          {/* Metal Bands */}
          <div className={`absolute top-3 left-0 right-0 h-0.5 ${config.destroyed ? 'bg-gray-700/80' : 'bg-amber-600/60'}`} />
          <div className={`absolute bottom-2 left-0 right-0 h-0.5 ${config.destroyed ? 'bg-gray-700/80' : 'bg-amber-600/60'}`} />
          
          {/* Cracks and damage for destroyed chest */}
          {config.destroyed && (
            <>
              <div className="absolute top-2 left-3 w-8 h-0.5 bg-gray-900/80 rotate-12" />
              <div className="absolute bottom-3 right-2 w-5 h-0.5 bg-gray-900/80 -rotate-20" />
              <div className="absolute bottom-5 left-1 w-3 h-3 rounded-full bg-gray-900/30" />
            </>
          )}

          {/* Treasure Glow when chest has items */}
          {count > 0 && (
            <motion.div
              className={`absolute inset-1 ${config.gemColor}/30 rounded blur-sm`}
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Treasure Type Emoji */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-lg">
          {config.emoji}
        </div>

        {/* Label */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/80 font-semibold text-center whitespace-nowrap">
          {config.name}
        </div>

        {/* Sparkle effects when count increases */}
        {count > 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}-${count}`}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 10}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -20],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Seaweed/coral around chest */}
      <motion.div
        className="absolute -bottom-2 -left-2 w-1 h-8 bg-gradient-to-t from-green-700/60 to-green-500/30 rounded-t-lg"
        animate={{
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: position * 0.3,
        }}
        style={{ transformOrigin: 'bottom center' }}
      />
    </div>
  );
};
