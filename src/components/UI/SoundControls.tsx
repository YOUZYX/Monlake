import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../utils/soundManager';

export const SoundControls: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(soundManager.isAudioEnabled());
  const [volume, setVolume] = useState(soundManager.getMasterVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Sync with sound manager state
    setIsEnabled(soundManager.isAudioEnabled());
    setVolume(soundManager.getMasterVolume());
  }, []);

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundManager.setEnabled(newState);
    
    // Play a test sound when enabling
    if (newState) {
      setTimeout(() => {
        soundManager.play('fish_hover');
      }, 100);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setMasterVolume(newVolume);
    
    // Play a test sound when adjusting volume
    if (isEnabled) {
      soundManager.play('treasure_update', newVolume);
    }
  };

  const handleMouseEnter = () => {
    if (isEnabled) {
      setShowVolumeSlider(true);
    }
  };

  const handleMouseLeave = () => {
    setShowVolumeSlider(false);
  };

  return (
    <div 
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Main Sound Icon Container */}
      <div className="relative flex items-center">
        {/* Main Sound Icon Bubble */}
        <div
          className={`relative w-16 h-16 rounded-full cursor-pointer backdrop-blur-md border-2 shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isEnabled 
              ? 'bg-gradient-to-br from-cyan-400/70 to-blue-500/80 border-cyan-300/90 shadow-cyan-400/70' 
              : 'bg-gradient-to-br from-gray-400/60 to-gray-600/70 border-gray-400/70 shadow-gray-400/60'
          }`}
          onClick={toggleSound}
          style={{
            boxShadow: isEnabled 
              ? '0 0 20px rgba(34, 211, 238, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)'
              : '0 0 10px rgba(107, 114, 128, 0.3), 0 4px 15px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Sound Icon */}
          <span
            className={`text-3xl transition-all duration-300 ${
              isEnabled ? 'text-white' : 'text-gray-300'
            }`}
            style={{ 
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              filter: isEnabled ? 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))' : 'none'
            }}
          >
            {isEnabled ? '🔊' : '🔇'}
          </span>

          {/* Bubble Effect Rings */}
          {isEnabled && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-cyan-300/40"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}

          {/* Volume Level Indicator */}
          <div
            className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-300 ${
              isEnabled ? 'bg-cyan-400/80' : 'bg-gray-400/50'
            }`}
            style={{
              transform: `translateX(-50%) scaleX(${volume})`,
              opacity: isEnabled ? 1 : 0.3
            }}
          />
        </div>

        {/* Volume Slider Panel - Slides from left to right */}
        <AnimatePresence>
          {showVolumeSlider && isEnabled && (
            <motion.div
              className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-ocean-900/95 backdrop-blur-md rounded-2xl border border-cyan-300/30 shadow-2xl overflow-hidden volume-slider-panel"
              initial={{ opacity: 0, scaleX: 0, x: -20 }}
              animate={{ opacity: 1, scaleX: 1, x: 0 }}
              exit={{ opacity: 0, scaleX: 0, x: -20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              style={{ 
                transformOrigin: 'left center',
                width: '200px',
                height: '60px'
              }}
            >
              <div className="flex items-center justify-center h-full px-4">
                {/* Volume Slider */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-cyan-300 text-sm">🔉</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bubble-slider slider-enabled"
                      style={{
                        background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${volume * 100}%, #1e293b ${volume * 100}%, #1e293b 100%)`
                      }}
                    />
                  </div>
                  <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded-full min-w-[40px] text-center">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 