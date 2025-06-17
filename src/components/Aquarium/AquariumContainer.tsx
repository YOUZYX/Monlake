import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish } from './Fish';
import { WaterEffect } from './WaterEffect';
import { CoralReef } from './CoralReef';
import { Jellyfish } from './Jellyfish';
import { DeadFish } from './DeadFish';
import { TreasureChest } from './TreasureChest';
import { Legend } from '../UI/Legend';
import { useMonadData } from '../../hooks/useMonadData';
import { useTransactionAnalysis } from '../../hooks/useTransactionAnalysis';
import { MonanimalFish, TransactionType, TransactionCounter, FailedTransaction } from '../../types';
import { ethers } from 'ethers';
import { soundManager } from '../../utils/soundManager';

// List of available Monanimal images
const MONANIMAL_IMAGES = [
  '/Monanimals/4ksalmonad.png',
  //'/Monanimals/Chog.png',
  //'/Monanimals/cutlandak2.png',
  '/Monanimals/fish_nad.png',
  //'/Monanimals/MolandakHD.png',
  //'/Monanimals/molandak_skilly.PNG',
  '/Monanimals/monanimal_1.png',
  '/Monanimals/monanimal_2.png',
  '/Monanimals/monanimal_3.png',
  '/Monanimals/monanimal_4.png',
  '/Monanimals/monanimal_5.png',
  '/Monanimals/monanimal_6.png',
  '/Monanimals/monanimal_7.png',
];

interface SpecialCreature {
  id: string;
  type: 'jellyfish' | 'deadfish';
  x: number;
  y: number;
  transactionHash?: string;
}

export const AquariumContainer: React.FC = () => {
  const { currentBlock, networkStats, isLoading, error } = useMonadData();
  const { 
    dominantType, 
    categorizedCounts, 
    totalTransactions, 
    isAnalyzing, 
    error: analysisError 
  } = useTransactionAnalysis(currentBlock?.number || null);
  const [fish, setFish] = useState<MonanimalFish[]>([]);
  const [specialCreatures, setSpecialCreatures] = useState<SpecialCreature[]>([]);
  const [transactionCounters, setTransactionCounters] = useState<TransactionCounter>({
    transfer: 0,
    swap: 0,
    mint: 0,
    contract: 0,
    failed: 0,
    other: 0,
  });
  const [fishedFish, setFishedFish] = useState<string | null>(null);
  const [showFishingRod, setShowFishingRod] = useState(false);
  const fishTimeoutsRef = useRef(new Map<string, NodeJS.Timeout>());
  
  // Local storage for tracking failed transactions
  const [failedTxHashes, setFailedTxHashes] = useState<Set<string>>(new Set());
  
  // Panel collapse state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Track processed blocks for percentage calculation
  const [processedBlocks, setProcessedBlocks] = useState(0);
  
  // Initialize failed transaction count from local storage
  useEffect(() => {
    try {
      // Reset failed transaction count on page load/refresh
      setTransactionCounters(prev => ({
        ...prev,
        failed: 0
      }));
      
      // Clear local storage for failed transactions on page refresh
      localStorage.removeItem('monlake_failed_tx');
      setFailedTxHashes(new Set());
      
      // Reset processed blocks counter
      setProcessedBlocks(0);
      
      console.log('🔄 Reset failed transaction counter and processed blocks on page refresh');
    } catch (error) {
      console.error('Error resetting failed transactions:', error);
    }
  }, []);

  // Generate random position within aquarium bounds
  const generateRandomPosition = useCallback(() => {
    const margin = 100;
    return {
      x: margin + Math.random() * (window.innerWidth - 2 * margin - 80),
      y: margin + Math.random() * (window.innerHeight - 2 * margin - 80),
    };
  }, []);

  // Generate random position for jellyfish (avoiding treasure chest area)
  const generateJellyfishPosition = useCallback(() => {
    const margin = 150;
    const treasureChestHeight = 180; // Reserve space for treasure chests (bottom-8 + chest height + labels)
    return {
      x: margin + Math.random() * (window.innerWidth - 2 * margin - 80),
      y: margin + Math.random() * (window.innerHeight - 2 * margin - 80 - treasureChestHeight),
    };
  }, []);

  // Generate random size for fish (enhanced)
  const generateRandomSize = useCallback(() => {
    return 50 + Math.random() * 50; // 50-100px
  }, []);

  // Get the dominant transaction type for the current block
  const getBlockTransactionType = useCallback((): TransactionType => {
    return dominantType || 'other';
  }, [dominantType]);

  // Generate random swimming direction
  const generateRandomDirection = useCallback(() => {
    return Math.random() * 360;
  }, []);

  // Add new fish when new block arrives (enhanced)
  useEffect(() => {
    if (!currentBlock) {
      console.log('No current block yet...');
      return;
    }

    console.log('New block received:', currentBlock.number, 'TXs:', currentBlock.txCount);

    // Get the dominant transaction type for this block
    const transactionType = getBlockTransactionType();
    
    // Add a fish for the block
    const position = generateRandomPosition();
    const newFish: MonanimalFish = {
      id: `fish-${currentBlock.number}-${Date.now()}`,
      src: MONANIMAL_IMAGES[Math.floor(Math.random() * MONANIMAL_IMAGES.length)],
      blockNumber: currentBlock.number,
      blockHash: currentBlock.hash,
      txCount: currentBlock.txCount,
      gasUsed: currentBlock.gasUsed,
      timestamp: currentBlock.timestamp,
      size: generateRandomSize(),
      transactionType: transactionType,
      direction: generateRandomDirection(),
      speed: 0.5 + Math.random() * 1.5,
      ...position,
    };

    setFish(prev => [...prev, newFish]);

    // Play block processed sound
    soundManager.play('block_processed');

    // Update transaction counters with real analysis data, but preserve local failed counter
    setTransactionCounters(prev => ({
      ...categorizedCounts,
      failed: prev.failed // Keep the local failed transaction count
    }));

    // Play treasure update sound when counters change
    soundManager.play('treasure_update', 0.8);

    // Increment processed blocks count
    setProcessedBlocks(prev => prev + 1);

    // Check if we have real failed transactions in the current block
    if (currentBlock?.failedTransactions && currentBlock.failedTransactions.length > 0) {
      // Track new failed transactions
      const newFailedTxs: string[] = [];
      
      // Spawn jellyfish only for real failed transactions with real hashes
      currentBlock.failedTransactions.forEach((tx, index) => {
        // Skip if we've already seen this transaction
        if (failedTxHashes.has(tx.hash)) {
          return;
        }
        
        // Add to new failed transactions
        newFailedTxs.push(tx.hash);
        
        // Use the real transaction hash
        const specialCreature: SpecialCreature = {
          id: `jellyfish-${currentBlock.number}-${Date.now()}-${index}`,
          type: 'jellyfish',
          transactionHash: tx.hash, // Real transaction hash
          ...generateJellyfishPosition(),
        };

        setSpecialCreatures(prev => [...prev, specialCreature]);
      });
      
      // Update local storage and state if we found new failed transactions
      if (newFailedTxs.length > 0) {
        // Update failed tx hashes set
        const updatedFailedTxs = new Set([...failedTxHashes, ...newFailedTxs]);
        setFailedTxHashes(updatedFailedTxs);
        
        // Don't update local storage since we want to reset on refresh
        
        // Update the failed transaction counter - accumulate total count
        setTransactionCounters(prev => {
          const newTotal = prev.failed + newFailedTxs.length;
          console.log(`📊 Updated failed transaction count: ${newTotal} (added ${newFailedTxs.length} new)`);
          return {
            ...prev,
            failed: newTotal // Add new failed transactions to existing count
          };
        });
        
        console.log(`🦑 Spawned ${newFailedTxs.length} jellyfish for real failed transactions in block ${currentBlock.number}`);
      }
    }

    // No more mock data - all data is real

  }, [currentBlock, categorizedCounts, dominantType, generateRandomPosition, generateJellyfishPosition, generateRandomSize, generateRandomDirection, getBlockTransactionType]);

  // Cleanup function to remove invisible fish
  useEffect(() => {
    const interval = setInterval(() => {
      setFish(prev => {
        const visibleFish = prev.filter(f => f.x >= 0 && f.x <= window.innerWidth && f.y >= 0 && f.y <= window.innerHeight);
        const invisibleFish = prev.filter(f => f.x < 0 || f.x > window.innerWidth || f.y < 0 || f.y > window.innerHeight);
        
        // Log the count of visible and invisible fish
        console.log('Visible fish:', visibleFish.length, 'Invisible fish:', invisibleFish.length);

        // Clear timeouts for invisible fish
        invisibleFish.forEach(fish => {
          const timeoutId = fishTimeoutsRef.current.get(fish.id);
          if (timeoutId) {
            clearTimeout(timeoutId);
            fishTimeoutsRef.current.delete(fish.id);
            console.log('Cleared timeout for invisible fish:', fish.id);
          }
        });

        return visibleFish;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Remove fish by ID with proper cleanup
  const removeFish = useCallback((fishId: string) => {
    // Clear any existing timeout for this fish
    if (fishTimeoutsRef.current.has(fishId)) {
      clearTimeout(fishTimeoutsRef.current.get(fishId));
      fishTimeoutsRef.current.delete(fishId);
    }
    
    // Remove the fish from state
    setFish(prev => prev.filter(f => f.id !== fishId));
    console.log(`Fish ${fishId} removed, timeouts cleared`);
  }, []);

  // Handle fish position changes from dragging
  const handleFishPositionChange = useCallback((fishId: string, newX: number, newY: number) => {
    setFish(prev => prev.map(f => 
      f.id === fishId ? { ...f, x: newX, y: newY } : f
    ));
    
    // Force a re-render to update swimming paths based on new position
    // This prevents animation conflicts
    console.log(`Fish ${fishId} position updated to (${newX}, ${newY})`);
  }, []);

  // Remove special creature by ID
  const removeSpecialCreature = useCallback((creatureId: string) => {
    setSpecialCreatures(prev => prev.filter(c => c.id !== creatureId));
  }, []);
  
  // Regular cleanup to ensure fish count is accurate
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Force cleanup of any stale fish that might be stuck
      const maxAge = Date.now() - 35000; // 35 seconds max age
      setFish(prev => {
        const oldFishCount = prev.length;
        const freshFish = prev.filter(f => {
          // Extract timestamp from ID if it contains it
          const idParts = f.id.split('-');
          const timeStamp = parseInt(idParts[idParts.length - 1]);
          return !isNaN(timeStamp) && timeStamp > maxAge;
        });
        
        if (oldFishCount !== freshFish.length) {
          console.log(`Cleaned up ${oldFishCount - freshFish.length} stale fish`);
        }
        
        return freshFish;
      });
    }, 10000); // Run cleanup every 10 seconds
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Fishing rod logic - activate when 10+ fish in tank
  useEffect(() => {
    if (fish.length >= 10 && !showFishingRod) {
      setShowFishingRod(true);
      // Auto-fish the oldest fish
      setTimeout(() => {
        if (fish.length > 0) {
          const oldestFish = fish[0];
          handleFishHook(oldestFish.id);
        }
      }, 1000);
    } else if (fish.length < 10) {
      setShowFishingRod(false);
    }
  }, [fish.length, showFishingRod]);

  // Handle fishing hook
  const handleFishHook = useCallback((fishId: string) => {
    setFishedFish(fishId);
    
    // After animation, remove the fish
    setTimeout(() => {
      removeFish(fishId);
      setFishedFish(null);
      setShowFishingRod(false);
    }, 2000);
  }, [removeFish]);

  // Fishing rod animation variants
  const fishingRodVariants = {
    hidden: {
      y: -200,
      opacity: 0,
    },
    fishing: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      }
    },
    hooking: {
      y: [0, 300, -100],
      transition: {
        duration: 2,
        times: [0, 0.6, 1],
        ease: "easeInOut",
      }
    }
  };

  return (
    <div className="aquarium-container">
      {/* Water effect background */}
      <WaterEffect />
      
      {/* Coral Reef at bottom */}
      <CoralReef />
      
      {/* Enhanced floating bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="bubble"
            style={{
              left: `${5 + i * 8}%`,
              width: `${6 + Math.random() * 16}px`,
              height: `${6 + Math.random() * 16}px`,
              background: i % 3 === 0 
                ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.5))'
                : i % 3 === 1 
                ? 'linear-gradient(45deg, rgba(107, 70, 193, 0.3), rgba(167, 139, 250, 0.5))'
                : 'linear-gradient(45deg, rgba(6, 182, 212, 0.3), rgba(103, 232, 249, 0.5))'
            }}
            animate={{
              y: [window.innerHeight + 50, -100],
              opacity: [0, 0.8, 0.6, 0],
              scale: [0.5, 1, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Fish */}
      <AnimatePresence>
        {fish.map((fishData) => (
          <Fish
            key={fishData.id}
            fish={fishData}
            onRemove={removeFish}
            onHook={showFishingRod ? handleFishHook : undefined}
            isBeingFished={fishedFish === fishData.id}
            onPositionChange={handleFishPositionChange}
          />
        ))}
      </AnimatePresence>

      {/* Special Creatures */}
      <AnimatePresence>
        {specialCreatures.map((creature) => {
          switch (creature.type) {
            case 'jellyfish':
              return (
                <Jellyfish
                  key={creature.id}
                  id={creature.id}
                  x={creature.x}
                  y={creature.y}
                  transactionHash={creature.transactionHash}
                  onRemove={removeSpecialCreature}
                />
              );
            case 'deadfish':
              return (
                <DeadFish
                  key={creature.id}
                  id={creature.id}
                  x={creature.x}
                  y={creature.y}
                  onRemove={removeSpecialCreature}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>

      {/* Treasure Chests at Bottom */}
      <TreasureChest type="transfer" count={transactionCounters.transfer} position={0} />
      <TreasureChest type="swap" count={transactionCounters.swap} position={1} />
      <TreasureChest type="mint" count={transactionCounters.mint} position={2} />
      <TreasureChest type="contract" count={transactionCounters.contract} position={3} />
      <TreasureChest type="other" count={transactionCounters.other} position={4} />
      <TreasureChest type="failed" count={transactionCounters.failed} position={5} />

      {/* Fishing rod */}
      <AnimatePresence>
        {showFishingRod && (
          <motion.div
            className="fishing-rod"
            variants={fishingRodVariants}
            initial="hidden"
            animate={fishedFish ? "hooking" : "fishing"}
            exit="hidden"
          >
            <div className="w-2 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full shadow-lg">
              {/* Fishing line */}
              <motion.div
                className="absolute top-full left-1/2 w-0.5 bg-gray-400 origin-top"
                style={{ height: fishedFish ? '300px' : '200px' }}
                animate={{
                  height: fishedFish ? ['200px', '300px', '0px'] : '200px',
                }}
                transition={{
                  duration: fishedFish ? 2 : 0.5,
                }}
              />
              
              {/* Hook */}
              <motion.div
                className="absolute left-1/2 w-3 h-3 bg-silver-400 rounded-full shadow-sm"
                style={{ top: fishedFish ? '300px' : '200px' }}
                animate={{
                  top: fishedFish ? ['200px', '300px', '0px'] : '200px',
                }}
                transition={{
                  duration: fishedFish ? 2 : 0.5,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Collapsible Aquarium Status Panel */}
      <motion.div 
        className="absolute top-4 right-4 bg-ocean-900/90 backdrop-blur-md rounded-xl border border-monad-cyan/30 shadow-2xl overflow-hidden"
        animate={{
          width: isPanelCollapsed ? "auto" : "320px",
          minWidth: isPanelCollapsed ? "auto" : "280px"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Panel Header - Always Visible */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-monad-cyan/10 transition-colors"
          onClick={() => {
            soundManager.play('panel_toggle');
            setIsPanelCollapsed(!isPanelCollapsed);
          }}
        >
          <div className="font-bold text-lg text-monad-cyan flex items-center gap-2">
            🌊 MonLake
          </div>
          <motion.div
            animate={{ rotate: isPanelCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="text-monad-cyan"
          >
            ▼
          </motion.div>
        </div>

        {/* Panel Content - Collapsible */}
        <AnimatePresence>
          {!isPanelCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 text-white text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">🐟 Fish Count:</span>
                    <span className="font-semibold text-blue-300">{fish.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">🦑 Jellyfish:</span>
                    <span className="font-semibold text-purple-300" title="Failed transaction jellyfish">{specialCreatures.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">📦 Latest Block:</span>
                    <span className="font-semibold text-green-300">#{currentBlock?.number || '...'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">⚡ Network:</span>
                    <span className={`font-semibold ${isLoading ? 'text-yellow-400 animate-pulse' : error ? 'text-red-400' : 'text-green-400'}`}>
                      {isLoading ? 'Syncing...' : error ? 'Offline' : 'Live'}
                    </span>
                  </div>
                </div>

                {/* Network Performance Stats */}
                {networkStats && (
                  <div className="mt-3 pt-3 border-t border-gray-600/30">
                    <div className="font-semibold text-monad-cyan mb-2 flex items-center gap-2">
                      📊 Network Performance
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">TPS:</span>
                        <span className="text-monad-blue font-mono font-bold">{networkStats.tps}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Avg Gas Price:</span>
                        <span className="text-green-400 font-mono font-bold">{networkStats.avgGasPrice} Gwei</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Est. Hashrate:</span>
                        <span className="text-purple-400 font-mono font-bold">{networkStats.networkHashrate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Distribution Percentages */}
                <div className="mt-3 pt-3 border-t border-gray-600/30">
                  <div className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    📊 Transaction Distribution
                    <span className="text-xs text-gray-400">({processedBlocks} blocks)</span>
                  </div>
                  {(() => {
                    const total = Object.values(transactionCounters).reduce((sum, count) => sum + count, 0);
                    if (total === 0) {
                      return <div className="text-xs text-gray-400">No transactions processed yet</div>;
                    }
                    
                    const getPercentage = (count: number) => ((count / total) * 100).toFixed(1);
                    
                    return (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-300">💎 Transfers:</span>
                          <span className="font-bold text-blue-400">{getPercentage(transactionCounters.transfer)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-300">🔄 Swaps:</span>
                          <span className="font-bold text-yellow-400">{getPercentage(transactionCounters.swap)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-300">🎨 Mints:</span>
                          <span className="font-bold text-green-400">{getPercentage(transactionCounters.mint)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-300">⚡ Contracts:</span>
                          <span className="font-bold text-purple-400">{getPercentage(transactionCounters.contract)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-teal-300">🧩 Other:</span>
                          <span className="font-bold text-teal-400">{getPercentage(transactionCounters.other)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-300">☠️ Failed:</span>
                          <span className="font-bold text-red-400">{getPercentage(transactionCounters.failed)}%</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700/50 text-center text-gray-400">
                          Total: {total.toLocaleString()} transactions
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {showFishingRod && (
                  <div className="text-yellow-400 mt-3 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎣</span>
                      <span className="font-semibold">Fishing in progress...</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading bubbles indicator */}
      {isLoading && (
        <div className="absolute top-8 right-8 z-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-br from-monad-blue/80 to-monad-cyan/60 rounded-full shadow-lg"
              style={{
                left: `${i * 12}px`,
              }}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                y: [0, -30, -60, -90],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
              exit={{ opacity: 0, scale: 0 }}
            />
          ))}
          <motion.div
            className="absolute top-24 left-6 text-xs text-monad-cyan font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Syncing...
          </motion.div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-800/80 backdrop-blur-sm rounded-lg p-3 border border-red-600/50 text-white max-w-xs">
          <div className="font-semibold text-red-400">Connection Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Legend Component */}
      <Legend />
    </div>
  );
};
