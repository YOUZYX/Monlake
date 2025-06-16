import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MonanimalFish } from '../../types';
import { formatUnits } from 'ethers';
import { soundManager } from '../../utils/soundManager';

interface FishProps {
  fish: MonanimalFish;
  onRemove: (id: string) => void;
  onHook?: (id: string) => void;
  isBeingFished?: boolean;
  onPositionChange?: (id: string, x: number, y: number) => void;
}

// Format gas value to be more readable
const formatGasValue = (gasUsed: string): string => {
  try {
    // Show in Ether (or Gwei if more readable)
    const ether = formatUnits(gasUsed, 18);
    const asNumber = parseFloat(ether);
    if (asNumber < 0.000001) {
      // Show in Gwei if very small
      return formatUnits(gasUsed, 9) + ' Gwei';
    }
    return asNumber.toLocaleString(undefined, { maximumFractionDigits: 6 }) + ' MON';
  } catch {
    return gasUsed;
  }
};

// Enhanced list of available Monanimal images
const MONANIMAL_IMAGES = [
  '/Monanimals/4ksalmonad.png',
  '/Monanimals/Chog.png',
  '/Monanimals/cutlandak2.png',
  '/Monanimals/fish_nad.png',
  '/Monanimals/MolandakHD.png',
  '/Monanimals/molandak_skilly.PNG',
  '/Monanimals/1.png',
  '/Monanimals/2.png',
  '/Monanimals/3.png',
  '/Monanimals/4.png',
  '/Monanimals/5.png',
  '/Monanimals/6.png',
  '/Monanimals/7.png',
  '/Monanimals/8.png',
  '/Monanimals/9.png',
  '/Monanimals/10.png',
  '/Monanimals/11.png',
];

export const Fish: React.FC<FishProps> = ({ fish, onRemove, onHook, isBeingFished = false, onPositionChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(fish.direction || Math.random() * 360);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fishRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-remove fish after 25-30 seconds
  useEffect(() => {
    // Play fish spawn sound when fish appears
    soundManager.play('fish_spawn');

    const timeout = setTimeout(() => {
      if (!isBeingFished) {
        soundManager.play('fish_disappear');
        onRemove(fish.id);
      }
    }, 25000 + Math.random() * 5000); // 25-30 seconds

    return () => clearTimeout(timeout);
  }, [fish.id, onRemove, isBeingFished]);

  // Random direction changes for more realistic swimming
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBeingFished) {
        setCurrentDirection(prev => prev + (Math.random() - 0.5) * 60);
      }
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isBeingFished]);

  // Calculate smart tooltip position
  const getTooltipPosition = () => {
    const fishX = fish.x + dragOffset.x;
    const fishY = fish.y + dragOffset.y;
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    const margin = 10;
    
    // Check if tooltip would go off-screen to the right
    const preferredLeft = fishX + fish.size + margin;
    const left = (preferredLeft + tooltipWidth > window.innerWidth) 
      ? fishX - tooltipWidth - margin 
      : preferredLeft;
    
    // Check if tooltip would go off-screen at the bottom
    const preferredTop = fishY - 20;
    const top = (preferredTop + tooltipHeight > window.innerHeight)
      ? fishY - tooltipHeight + fish.size
      : preferredTop;
    
    return {
      left: Math.max(margin, left),
      top: Math.max(margin, top)
    };
  };

  // Handle tooltip display
  const handleMouseEnter = () => {
    setIsHovered(true);
    soundManager.play('fish_hover', 0.5); // Quieter hover sound
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Handle click to open Monad explorer
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If dragging, don't open explorer
    if (isDragging) return;
    
    // If fishing mode is active, use fishing hook
    if (onHook && !isBeingFished) {
      soundManager.play('fishing_cast');
      onHook(fish.id);
      return;
    }
    
    // Open Monad explorer for this block
    soundManager.play('fish_caught', 0.8); // Success sound when clicking to explorer
    const explorerUrl = `https://testnet.monadexplorer.com/block/${fish.blockHash}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle drag functionality
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Calculate new position based on original fish position + current drag offset + new drag
    const currentX = fish.x + dragOffset.x;
    const currentY = fish.y + dragOffset.y;
    const newX = currentX + info.offset.x;
    const newY = currentY + info.offset.y;
    
    // Keep fish within bounds
    const boundedX = Math.max(0, Math.min(window.innerWidth - fish.size, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - fish.size, newY));
    
    // Update drag offset relative to original fish position
    setDragOffset({ 
      x: boundedX - fish.x, 
      y: boundedY - fish.y 
    });
    
    // Notify parent component of position change
    if (onPositionChange) {
      onPositionChange(fish.id, boundedX, boundedY);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setShowTooltip(false); // Hide tooltip while dragging
    soundManager.play('fish_drag', 0.6);
  };

  // Generate random swimming path within aquarium bounds
  const generateSwimmingPath = useCallback(() => {
    const aquariumWidth = window.innerWidth - 400; // Account for right panel
    const aquariumHeight = window.innerHeight - 100; // Account for margins
    const margin = 100;
    
    // Generate 3-4 waypoints for smoother movement (fewer waypoints = smoother)
    const waypoints = [];
    const numWaypoints = 3 + Math.floor(Math.random() * 2);
    
    // Start from current fish position for smoother transitions
    const startX = fish.x + dragOffset.x;
    const startY = fish.y + dragOffset.y;
    
    for (let i = 0; i < numWaypoints; i++) {
      // Create waypoints in a more natural pattern around the current position
      const angle = (i / numWaypoints) * 2 * Math.PI + Math.random() * Math.PI / 2;
      const distance = 100 + Math.random() * 200; // Moderate swimming distance
      
      let x = startX + Math.cos(angle) * distance;
      let y = startY + Math.sin(angle) * distance;
      
      // Keep within bounds
      x = Math.max(margin, Math.min(aquariumWidth - margin, x));
      y = Math.max(margin, Math.min(aquariumHeight - margin, y));
      
      waypoints.push({ x, y });
    }
    
    return waypoints;
  }, [fish.x, fish.y, dragOffset.x, dragOffset.y]);

  const [swimmingPath, setSwimmingPath] = useState(() => generateSwimmingPath());
  const [lastDragPosition, setLastDragPosition] = useState({ x: fish.x, y: fish.y });

  // Only regenerate swimming path when fish is actually dragged to a new position
  useEffect(() => {
    const positionChanged = Math.abs(fish.x - lastDragPosition.x) > 100 || Math.abs(fish.y - lastDragPosition.y) > 100;
    
    if (positionChanged && !isDragging && !isBeingFished) {
      // Add a small delay to prevent rapid path changes
      const timeoutId = setTimeout(() => {
        setSwimmingPath(generateSwimmingPath());
        setLastDragPosition({ x: fish.x, y: fish.y });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fish.x, fish.y, isDragging, isBeingFished, lastDragPosition.x, lastDragPosition.y, generateSwimmingPath]);

  // Regenerate swimming path periodically to keep movement interesting (less frequent)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && !isBeingFished) {
        setSwimmingPath(generateSwimmingPath());
      }
    }, 60000 + Math.random() * 30000); // Every 60-90 seconds (less frequent)

    return () => clearInterval(interval);
  }, []);

  // Calculate rotation based on swimming direction
  const calculateRotations = () => {
    const rotations = [0];
    for (let i = 1; i < swimmingPath.length; i++) {
      const prevPoint = i === 1 ? { x: fish.x, y: fish.y } : swimmingPath[i - 1];
      const currentPoint = swimmingPath[i];
      const angle = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x) * 180 / Math.PI;
      rotations.push(angle * 0.1); // Subtle rotation based on direction
    }
    return rotations;
  };

  // Create a stable animation key to prevent restarts
  const [animationKey] = useState(() => `swim-${fish.id}-${Date.now()}`);
  
  // Stable fish reference to prevent unnecessary re-renders
  const stableFish = useRef(fish);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Only update stable fish reference when significant changes occur
  useEffect(() => {
    if (!isInitialized) {
      stableFish.current = fish;
      setIsInitialized(true);
    } else {
      // Only update if there are significant changes (not just minor prop updates)
      const significantChange = 
        Math.abs(stableFish.current.x - fish.x) > 10 ||
        Math.abs(stableFish.current.y - fish.y) > 10 ||
        stableFish.current.blockNumber !== fish.blockNumber;
      
      if (significantChange) {
        stableFish.current = fish;
      }
    }
  }, [fish, isInitialized]);

  // Enhanced swimming animation with free movement
  const swimVariants = {
    swimming: {
      x: swimmingPath.map((point: { x: number; y: number }) => point.x - stableFish.current.x),
      y: swimmingPath.map((point: { x: number; y: number }) => point.y - stableFish.current.y),
      rotate: calculateRotations(),
      scale: [1, 1.02, 0.98, 1.01, 0.99, 1],
      transition: {
        duration: 25 + Math.random() * 10, // Slower, more stable: 25-35 seconds
        repeat: Infinity,
        ease: "easeInOut",
        times: swimmingPath.map((_: any, i: number) => i / (swimmingPath.length - 1))
      }
    },
    beingFished: {
      scale: [1, 1.3, 1.1, 1.2, 1],
      rotate: [0, 15, -10, 20, 0],
      y: [0, -5, 5, -3, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Determine which Monanimal image to use (deterministic based on fish.id)
  const imageIndex = parseInt(fish.id.replace(/\D/g, ''), 10) % MONANIMAL_IMAGES.length;
  const imageSrc = fish.src || MONANIMAL_IMAGES[imageIndex];

  return (
    <>
      <motion.div
        key={animationKey}
        ref={fishRef}
        className={`fish-avatar enhanced-fish ${isBeingFished ? 'being-fished' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: fish.x + dragOffset.x,
          top: fish.y + dragOffset.y,
          width: fish.size,
          height: fish.size,
          zIndex: isBeingFished ? 100 : isDragging ? 50 : 10,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        variants={swimVariants}
        animate={isBeingFished ? "beingFished" : isDragging ? false : "swimming"}
        initial={{ opacity: 0, scale: 0, rotate: currentDirection / 4 }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.8 
          }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.3, 
          rotate: 180,
          transition: { duration: 0.5 }
        }}
        drag={!isBeingFished}
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileHover={!isDragging ? { 
          scale: 1.08, 
          rotate: 3,
          transition: { duration: 0.3, ease: "easeOut" }
        } : {}}
        whileTap={{ scale: 0.9 }}
      >
        <img
          src={imageSrc}
          alt={`Monanimal #${fish.blockNumber}`}
          className="w-full h-full object-contain rounded-lg"
          style={{
            filter: isBeingFished 
              ? 'brightness(1.3) drop-shadow(0 0 15px rgba(107, 70, 193, 0.9)) saturate(1.2)'
              : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.05)',
            transform: currentDirection > 90 && currentDirection < 270 ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
        
        {/* Enhanced floating effect with color based on transaction count */}
        <motion.div
          className="absolute -inset-2 rounded-lg"
          style={{
            background: fish.txCount > 20 
              ? 'linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))'
              : fish.txCount > 10
              ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(107, 70, 193, 0.2))'
              : 'linear-gradient(45deg, rgba(107, 70, 193, 0.15), rgba(6, 182, 212, 0.15))'
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.03, 1],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bubble trail for active fish */}
        {!isBeingFished && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${fish.size * 0.1}px`,
                  top: `${fish.size * 0.3 + i * 8}px`,
                }}
                animate={{
                  x: [-5, -15, -25],
                  y: [-5, -15, -25],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Enhanced Tooltip with more transaction details */}
      {showTooltip && isHovered && !isDragging && (
        <motion.div
          className="tooltip bg-gradient-to-br from-ocean-900/95 to-ocean-800/95 border border-monad-cyan/30"
          style={{
            position: 'fixed',
            ...getTooltipPosition(),
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            maxWidth: '300px',
            pointerEvents: 'none'
          }}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-xs space-y-1 min-w-max">
            <div className="font-semibold text-monad-cyan border-b border-monad-cyan/30 pb-1">
              🐟 Block #{fish.blockNumber}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">📊</span>
              <span>Transactions: {fish.txCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-400">⛽</span>
              <span>Gas Used: {formatGasValue(fish.gasUsed)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">🕒</span>
              <span className="text-gray-300">
                {new Date(fish.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
            {fish.transactionType && (
              <div className="flex items-center gap-1 pt-1 border-t border-gray-600/30">
                <span className="text-green-400">🔄</span>
                <span className="text-green-300 capitalize">{fish.transactionType}</span>
              </div>
            )}
            <div className="text-xs text-gray-400 italic mt-1 space-y-1">
              {onHook ? (
                <div>Click to catch! 🎣</div>
              ) : (
                <div>Click to view on explorer! 🔍</div>
              )}
              <div>Drag to move around! 🖱️</div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};