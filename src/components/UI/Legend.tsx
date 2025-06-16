import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Legend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const legendItems = [
    {
      icon: '🐟',
      name: 'Monanimal Fish',
      description: 'Represents a new block with transactions',
      color: 'text-blue-400'
    },
    {
      icon: '🦑',
      name: 'Failed Transaction Jellyfish',
      description: 'Shows failed transactions - falls slowly, stays 5s, then fades. Click to view on explorer!',
      color: 'text-red-400'
    },
    {
      icon: '💀',
      name: 'Dead Fish',
      description: 'Rare dramatic effect that sinks to bottom',
      color: 'text-gray-400'
    },
    {
      icon: '📦',
      name: 'Treasure Chests',
      description: 'Count different transaction types in real-time',
      color: 'text-amber-400'
    },
    {
      icon: '💎',
      name: 'Transfer Chest',
      description: 'Counts token transfer transactions',
      color: 'text-blue-400'
    },
    {
      icon: '🔄',
      name: 'DEX Swap Chest',
      description: 'Counts DEX swap transactions',
      color: 'text-yellow-400'
    },
    {
      icon: '🎨',
      name: 'NFT Mint Chest',
      description: 'Counts NFT minting transactions',
      color: 'text-green-400'
    },
    {
      icon: '⚡',
      name: 'Contract Chest',
      description: 'Counts smart contract deployments',
      color: 'text-purple-400'
    },
    {
      icon: '🧩',
      name: 'Other TX Chest',
      description: 'Counts other types of transactions',
      color: 'text-teal-400'
    },
    {
      icon: '☠️',
      name: 'Failed TX Chest',
      description: 'Counts failed transactions (destroyed chest)',
      color: 'text-red-400'
    },
    {
      icon: '🎣',
      name: 'Fishing Rod',
      description: 'Appears when 10+ fish are present',
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="fixed top-6 left-6 z-30">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-ocean-900/80 backdrop-blur-md rounded-full w-14 h-14 border border-monad-cyan/30 text-monad-cyan hover:bg-ocean-800/80 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-xl">📖</span>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-3 bg-ocean-900/95 backdrop-blur-md rounded-xl p-4 border border-monad-cyan/30 shadow-2xl max-w-xs"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="text-white">
              <h3 className="text-lg font-bold text-monad-cyan mb-3 border-b border-monad-cyan/30 pb-2">
                🌊 Creature Guide
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">{legendItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="flex items-start gap-3 p-2 rounded-lg bg-ocean-800/30 hover:bg-ocean-700/40 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className={`font-semibold text-sm ${item.color}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-600/30 text-xs text-gray-400">
                <p className="flex items-center gap-1">
                  <span>💡</span>
                  <span>Click fish to catch them with the fishing rod!</span>
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <span>🔄</span>
                  <span>Background shows real Monad blockchain activity</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
