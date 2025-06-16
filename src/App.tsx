import React from 'react';
import { AquariumContainer } from './components/Aquarium/AquariumContainer';
import { SoundControls } from './components/UI/SoundControls';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-900 via-ocean-800 to-ocean-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-monad-purple/10 via-transparent to-monad-blue/10" />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Aquarium Container - Full Screen */}
        <AquariumContainer />
        
        {/* Sound Controls */}
        <SoundControls />
      </div>
      
      {/* Footer Attribution 
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 z-30">
        <div className="bg-ocean-800/60 backdrop-blur-sm rounded px-2 py-1">
          Monlake - Monad Mission 4 🐟
        </div>
      </div>*/}
    </div>
  );
};

export default App;