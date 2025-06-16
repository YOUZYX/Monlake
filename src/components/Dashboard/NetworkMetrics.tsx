import React from 'react';
import { motion } from 'framer-motion';

interface NetworkMetricsProps {
  networkStats?: {
    latestBlock: number;
    tps: number;
    avgGasPrice: string;
    totalTxs: number;
    networkHashrate: string;
    nativeCurrency?: string;
  };
}

const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ networkStats }) => {
    // Enhanced placeholder data for network metrics
    const metrics = networkStats || {
        latestBlock: 123456,
        tps: 45,
        avgGasPrice: '2.5',
        totalTxs: 1234567,
        networkHashrate: '1.2 TH/s',
        nativeCurrency: 'MON'
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const metricItems = [
        {
            icon: '📦',
            label: 'Latest Block',
            value: `#${formatNumber(metrics.latestBlock)}`,
            color: 'text-blue-400'
        },
        {
            icon: '⚡',
            label: 'Transactions/sec',
            value: metrics.tps.toString(),
            color: 'text-green-400'
        },
        {
            icon: '⛽',
            label: `Avg Gas Price (${metrics.nativeCurrency || 'MON'})`,
            value: metrics.avgGasPrice,
            color: 'text-purple-400'
        },
        {
            icon: '🔄',
            label: 'Total Transactions',
            value: formatNumber(metrics.totalTxs),
            color: 'text-yellow-400'
        },
        {
            icon: '💎',
            label: 'Network Hashrate',
            value: metrics.networkHashrate,
            color: 'text-cyan-400'
        }
    ];

    return (
        <motion.div 
            className="p-6 bg-gradient-to-br from-ocean-900/90 to-ocean-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-monad-cyan/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2 
                className="text-2xl font-bold mb-6 text-monad-cyan flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                🌊 Monad Network Metrics
            </motion.h2>
            
            <div className="grid gap-4">
                {metricItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        className="flex items-center justify-between p-3 bg-ocean-800/40 rounded-lg border border-ocean-600/30 hover:border-monad-cyan/40 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-gray-300 font-medium">{item.label}:</span>
                        </div>
                        <span className={`font-bold text-lg ${item.color}`}>
                            {item.value}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Live indicator */}
            <motion.div 
                className="mt-4 flex items-center justify-center gap-2 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-semibold">Live Network Data</span>
            </motion.div>
        </motion.div>
    );
};

export default NetworkMetrics;