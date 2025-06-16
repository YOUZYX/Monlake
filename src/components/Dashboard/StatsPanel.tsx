import React from 'react';
import { motion } from 'framer-motion';
import { NetworkStats, RpcEndpoint } from '../../types';

interface StatsPanelProps {
  networkStats: NetworkStats | null;
  selectedRpc: RpcEndpoint;
  availableRpcs: RpcEndpoint[];
  onRpcChange: (rpc: RpcEndpoint) => void;
  isLoading: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  networkStats,
  selectedRpc,
  availableRpcs,
  onRpcChange,
  isLoading,
}) => {
  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    return num.toLocaleString();
  };

  return (
    <div className="fixed left-4 top-4 w-72 z-20">
      <motion.div
        className="sidebar-panel space-y-4"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center border-b border-ocean-600/50 pb-3">
          <h2 className="text-xl font-bold text-white mb-1">Monlake</h2>
          <p className="text-sm text-gray-300">Monad Testnet Aquarium</p>
        </div>

        {/* Network Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-monad-cyan mb-2">Network Stats</h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-ocean-600 rounded"></div>
              <div className="h-4 bg-ocean-600 rounded w-3/4"></div>
              <div className="h-4 bg-ocean-600 rounded w-1/2"></div>
            </div>
          ) : networkStats ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Latest Block:</span>
                <span className="text-white font-mono">#{formatNumber(networkStats.latestBlock)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">TPS:</span>
                <span className="text-monad-blue font-mono">{networkStats.tps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Gas Price:</span>
                <span className="text-green-400 font-mono">{networkStats.avgGasPrice} {networkStats.nativeCurrency || 'MON'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Hashrate:</span>
                <span className="text-purple-400 font-mono">{networkStats.networkHashrate}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No data available</div>
          )}
        </div>

        {/* RPC Selector */}
        <div className="space-y-3 border-t border-ocean-600/50 pt-3">
          <h3 className="text-sm font-semibold text-monad-cyan mb-2">RPC Endpoint</h3>
          <div className="space-y-2">
            {availableRpcs.map((rpc) => (
              <motion.button
                key={rpc.name}
                onClick={() => onRpcChange(rpc)}
                className={`
                  w-full p-2 rounded-lg text-left text-xs transition-all
                  ${selectedRpc.name === rpc.name
                    ? 'bg-monad-purple/30 border border-monad-purple text-white'
                    : 'bg-ocean-700/50 border border-ocean-600/30 text-gray-300 hover:bg-ocean-600/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{rpc.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    selectedRpc.name === rpc.name ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                </div>
                {rpc.latency && (
                  <div className="text-gray-400 mt-1">
                    Latency: {rpc.latency}ms
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Aquarium Controls */}
        <div className="space-y-3 border-t border-ocean-600/50 pt-3">
          <h3 className="text-sm font-semibold text-monad-cyan mb-2">Aquarium Controls</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• New blocks spawn Monanimals</div>
            <div>• Hover fish for block details</div>
            <div>• Auto-fishing at 10+ fish</div>
            <div>• Fish disappear after 25-30s</div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="space-y-2 border-t border-ocean-600/50 pt-3">
          <h3 className="text-sm font-semibold text-monad-cyan mb-2">Did You Know?</h3>
          <div className="text-xs text-gray-300">
            Monanimals are the native creatures of the Monad blockchain ecosystem! 🐟
          </div>
        </div>
      </motion.div>
    </div>
  );
};