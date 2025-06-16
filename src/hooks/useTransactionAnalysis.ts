import { useState, useEffect, useCallback } from 'react';
import { hyperSyncService } from '../services/hypersync';
import { TransactionType, TransactionCounter } from '../types';

interface TransactionAnalysisData {
  blockNumber: number;
  dominantType: TransactionType;
  categorizedCounts: TransactionCounter;
  totalTransactions: number;
  isAnalyzing: boolean;
  error: string | null;
}

export const useTransactionAnalysis = (blockNumber: number | null) => {
  const [analysisData, setAnalysisData] = useState<TransactionAnalysisData>({
    blockNumber: 0,
    dominantType: 'other',
    categorizedCounts: {
      transfer: 0,
      swap: 0,
      mint: 0,
      contract: 0,
      failed: 0,
      other: 0,
    },
    totalTransactions: 0,
    isAnalyzing: false,
    error: null,
  });

  const analyzeBlock = useCallback(async (blockNum: number) => {
    if (!blockNum || blockNum <= 0) {
      console.log('Invalid block number for analysis:', blockNum);
      return;
    }

    console.log('🔍 Starting transaction analysis for block:', blockNum);

    setAnalysisData(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
    }));

    try {
      console.log('📡 Calling hyperSyncService.getBlockTransactions for block:', blockNum);
      
      const { transactions, categorizedCounts } = await hyperSyncService.getBlockTransactions(blockNum);
      
      console.log('📊 Raw analysis results:', {
        blockNumber: blockNum,
        transactionCount: transactions.length,
        categorizedCounts,
      });

      // Calculate dominant transaction type
      let dominantType: TransactionType = 'other';
      let maxCount = 0;
      
      Object.entries(categorizedCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantType = type as TransactionType;
        }
      });

      const totalTransactions = transactions.length;

      console.log('✅ Block analysis complete:', {
        blockNumber: blockNum,
        totalTransactions,
        dominantType,
        categorizedCounts,
      });

      setAnalysisData({
        blockNumber: blockNum,
        dominantType,
        categorizedCounts,
        totalTransactions,
        isAnalyzing: false,
        error: null,
      });

    } catch (error) {
      console.error('❌ Error analyzing block transactions:', error);
      setAnalysisData(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []);

  // Analyze block when blockNumber changes
  useEffect(() => {
    if (blockNumber && blockNumber > 0) {
      console.log('🎯 Block number changed, triggering analysis:', blockNumber);
      analyzeBlock(blockNumber);
    } else {
      console.log('⏳ Waiting for valid block number, current:', blockNumber);
    }
  }, [blockNumber, analyzeBlock]);

  return {
    ...analysisData,
    analyzeBlock,
  };
}; 