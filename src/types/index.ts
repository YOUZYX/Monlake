// src/types/index.ts

export interface MonanimalFish {
  id: string;
  src: string;
  x: number;
  y: number;
  blockNumber: number;
  blockHash: string;
  txCount: number;
  gasUsed: string;
  timestamp: number;
  size: number;
  transactionType?: TransactionType;
  direction?: number; // Swimming direction in degrees
  speed?: number;
}

export type TransactionType = 'transfer' | 'swap' | 'mint' | 'contract' | 'failed' | 'other';

interface SpecialCreature {
  id: string;
  type: 'jellyfish' | 'deadfish' | 'transaction';
  x: number;
  y: number;
  transactionType?: TransactionType;
  transactionHash?: string;
}

export interface TransactionCounter {
  transfer: number;
  swap: number;
  mint: number;
  contract: number;
  failed: number;
  other: number;
}

export interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  gasUsed: string;
  gasLimit: string;
  txCount: number;
  miner: string;
  failedTransactions?: FailedTransaction[];
}

export interface FailedTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  blockNumber: number;
}

export interface NetworkStats {
  latestBlock: number;
  tps: number;
  avgGasPrice: string;
  totalTxs: number;
  networkHashrate: string;
  nativeCurrency: string; // MON for Monad
}

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  tokenType: 'gMON' | 'aprMON' | 'OTHER';
  blockNumber: number;
  timestamp: number;
}

export interface RpcEndpoint {
  name: string;
  url: string;
  isActive: boolean;
  latency?: number;
}

export interface AquariumState {
  fish: MonanimalFish[];
  isLoading: boolean;
  networkStats: NetworkStats | null;
  recentTransfers: TokenTransfer[];
  selectedRpc: RpcEndpoint | null;
}