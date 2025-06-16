import { TransactionType } from '../types';
import { ethers } from 'ethers';

// Monad Testnet configuration
const MONAD_TESTNET_HYPERSYNC_URL = 'https://monad-testnet.hypersync.xyz';
const MONAD_TESTNET_HYPERSYNC_BACKUP_URL = 'https://10143.hypersync.xyz';
const MONAD_TESTNET_HYPERRPC_URL = 'https://monad-testnet.rpc.hypersync.xyz';
const MONAD_TESTNET_HYPERRPC_BACKUP_URL = 'https://10143.rpc.hypersync.xyz';

// Event Signatures (keccak256 hashed) and Function Signatures
const EVENT_SIGNATURES = {
  // ERC721/ERC20 Transfer event
  ERC721_TRANSFER: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  // ERC1155 Transfer events
  ERC1155_SINGLE_TRANSFER: "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
  ERC1155_BATCH_TRANSFER: "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb",
  // Uniswap V2/V3 Swap events
  UNISWAP_V2_SWAP: "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
  UNISWAP_V3_SWAP: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
};

const FUNCTION_SIGNATURES = {
  // ERC20 Transfer functions
  ERC20_TRANSFER: "0xa9059cbb", // transfer(address,uint256)
  ERC20_TRANSFER_FROM: "0x23b872dd", // transferFrom(address,address,uint256)
  
  // DEX/Swap related
  SWAP_EXACT_TOKENS_FOR_TOKENS: "0x38ed1739", // swapExactTokensForTokens
  SWAP_TOKENS_FOR_EXACT_TOKENS: "0x8803dbee", // swapTokensForExactTokens
  SWAP_EXACT_ETH_FOR_TOKENS: "0x7ff36ab5", // swapExactETHForTokens
  SWAP_TOKENS_FOR_EXACT_ETH: "0x4a25d94a", // swapTokensForExactETH
  UNISWAP_V2_SWAP: "0x022c0d9f", // swap(uint256,uint256,address,bytes)
  
  // NFT Minting
  MINT: "0x40c10f19", // mint(address,uint256)
  SAFE_MINT: "0xa1448194", // safeMint(address,uint256)
  MINT_TO: "0x449a52f8", // mintTo(address,uint256)
  
  // Other common functions
  APPROVE: "0x095ea7b3", // approve(address,uint256)
  SET_APPROVAL_FOR_ALL: "0xa22cb465", // setApprovalForAll(address,bool)
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Known contract addresses on Monad testnet (these would be updated with actual addresses)
const KNOWN_CONTRACTS = {
  DEX_ROUTERS: [] as string[],
  NFT_CONTRACTS: [] as string[],
  TOKEN_CONTRACTS: [] as string[]
};

// HyperSync API interfaces
interface HyperSyncQuery {
  from_block: number;
  to_block?: number;
  transactions?: Array<{}>;
  field_selection: {
    transaction: string[];
  };
  include_all_blocks?: boolean;
}

interface HyperSyncResponse {
  data: {
    transactions: Array<{
      block_number?: number;
      transaction_index?: number;
      hash?: string;
      from?: string;
      to?: string;
      value?: string;
      input?: string;
      status?: number;
      gas?: string;
      gas_used?: string;
      gas_price?: string;
    }>;
  };
  next_block: number;
  archive_height?: number;
  total_execution_time: number;
}

export class MonadHyperSyncService {
  private fallbackProvider: ethers.JsonRpcProvider;
  private backupProvider: ethers.JsonRpcProvider;
  
  // Cumulative counters that persist across blocks
  private cumulativeCounts: Record<TransactionType, number> = {
    transfer: 0,
    swap: 0,
    mint: 0,
    contract: 0,
    failed: 0,
    other: 0,
  };

  constructor() {
    this.fallbackProvider = new ethers.JsonRpcProvider(MONAD_TESTNET_HYPERRPC_URL);
    this.backupProvider = new ethers.JsonRpcProvider(MONAD_TESTNET_HYPERRPC_BACKUP_URL);
  }

  /**
   * Get cumulative transaction counts across all processed blocks
   */
  getCumulativeCounts(): Record<TransactionType, number> {
    return { ...this.cumulativeCounts };
  }

  /**
   * Reset cumulative counters (useful for testing or restarting)
   */
  resetCumulativeCounts(): void {
    this.cumulativeCounts = {
      transfer: 0,
      swap: 0,
      mint: 0,
      contract: 0,
      failed: 0,
      other: 0,
    };
  }

  /**
   * Categorize a transaction based on its input data, logs, and recipient using improved logic
   */
  categorizeTransaction(tx: any, receipt?: any): TransactionType {
    const isDebugMode = false; // Set to true for detailed logging
    
    if (isDebugMode) {
      console.log(`🔍 Categorizing transaction:`, {
        hash: tx.hash?.slice(0, 10),
        hasTo: !!tx.to,
        to: tx.to?.slice(0, 10),
        hasInput: !!tx.input,
        inputLength: tx.input?.length,
        inputPreview: tx.input?.slice(0, 10),
        hasValue: !!tx.value,
        value: tx.value,
        status: tx.status || receipt?.status,
        hasReceipt: !!receipt,
        hasLogs: !!(receipt?.logs?.length)
      });
    }

    // 1. Check for failed transactions
    const status = tx.status || receipt?.status;
    if (isDebugMode) {
      console.log(`🔍 Status check:`, {
        txStatus: tx.status,
        receiptStatus: receipt?.status,
        finalStatus: status,
        statusType: typeof status
      });
    }
    
    // Handle different status formats: 0, "0", "0x0", false
    if (status !== undefined && status !== null) {
      const isFailed = status === 0 || 
                      status === '0' || 
                      status === '0x0' || 
                      status === false ||
                      (typeof status === 'string' && parseInt(status) === 0);
      
      if (isFailed) {
        if (isDebugMode) console.log(`❌ Transaction failed, status: ${status} (type: ${typeof status})`);
        return 'failed';
      }
    }

    // 2. Smart Contract Creation
    if (tx.to === null && receipt?.contractAddress) {
      if (isDebugMode) console.log(`🏗️ Contract deployment detected`);
      return 'contract';
    }

    // 3. NFT Mint detection using logs (most accurate)
    if (receipt?.logs) {
      for (const log of receipt.logs) {
        // ERC721 Mint: Transfer(from: 0x0, to: someone)
        if (
          log.topics?.[0] === EVENT_SIGNATURES.ERC721_TRANSFER &&
          log.topics?.[1] === `0x${ZERO_ADDRESS.slice(2).padStart(64, '0')}`
        ) {
          if (isDebugMode) console.log(`🎨 ERC721 NFT Mint detected via logs`);
          return 'mint';
        }

        // ERC1155 Mint: TransferSingle or TransferBatch
        if (
          log.topics?.[0] === EVENT_SIGNATURES.ERC1155_SINGLE_TRANSFER ||
          log.topics?.[0] === EVENT_SIGNATURES.ERC1155_BATCH_TRANSFER
        ) {
          // Check if from address in data is zero address (mint)
          const fromAddress = log.data?.slice(0, 66); // 0x + 64 chars
          if (fromAddress === `0x${ZERO_ADDRESS.slice(2).padStart(64, '0')}`) {
            if (isDebugMode) console.log(`🎨 ERC1155 NFT Mint detected via logs`);
            return 'mint';
          }
        }

        // Swap detection via events
        if (
          log.topics?.[0] === EVENT_SIGNATURES.UNISWAP_V2_SWAP ||
          log.topics?.[0] === EVENT_SIGNATURES.UNISWAP_V3_SWAP
        ) {
          if (isDebugMode) console.log(`🔄 Swap detected via logs`);
          return 'swap';
        }
      }
    }

    // 4. Transfer detection
    const value = tx.value ? (typeof tx.value === 'string' ? BigInt(tx.value) : BigInt(tx.value.toString())) : BigInt(0);
    const input = tx.input?.toLowerCase() || '';

    // Native token transfer (ETH/MON)
    if (value > 0 && (input === '0x' || input === '')) {
      if (isDebugMode) console.log(`💰 Native token transfer detected`);
      return 'transfer';
    }

    // ERC20 transfers via function signatures
    if (input.startsWith(FUNCTION_SIGNATURES.ERC20_TRANSFER) || input.startsWith(FUNCTION_SIGNATURES.ERC20_TRANSFER_FROM)) {
      if (isDebugMode) console.log(`💸 ERC20 transfer detected`);
      return 'transfer';
    }

    // 5. Swap detection via function signatures
    const swapSignatures = [
      FUNCTION_SIGNATURES.SWAP_EXACT_TOKENS_FOR_TOKENS,
      FUNCTION_SIGNATURES.SWAP_TOKENS_FOR_EXACT_TOKENS,
      FUNCTION_SIGNATURES.SWAP_EXACT_ETH_FOR_TOKENS,
      FUNCTION_SIGNATURES.SWAP_TOKENS_FOR_EXACT_ETH,
      FUNCTION_SIGNATURES.UNISWAP_V2_SWAP,
    ];
    
    for (const swapSig of swapSignatures) {
      if (input.startsWith(swapSig)) {
        if (isDebugMode) console.log(`🔄 Swap detected via function signature`);
        return 'swap';
      }
    }

    // 6. NFT Mint detection via function signatures (fallback)
    const mintSignatures = [
      FUNCTION_SIGNATURES.MINT,
      FUNCTION_SIGNATURES.SAFE_MINT,
      FUNCTION_SIGNATURES.MINT_TO,
    ];
    
    for (const mintSig of mintSignatures) {
      if (input.startsWith(mintSig)) {
        if (isDebugMode) console.log(`🎨 NFT Mint detected via function signature`);
        return 'mint';
      }
    }

    // 7. Contract interactions
    if (tx.to && input && input.length > 2) {
      if (isDebugMode) console.log(`📜 Contract interaction detected`);
      return 'contract';
    }

    // 8. Default category
    if (isDebugMode) console.log(`❓ Other transaction type`);
    return 'other';
  }

  /**
   * Fetch and categorize transactions for a specific block using HyperSync REST API
   */
  async getBlockTransactions(blockNumber: number): Promise<{
    transactions: any[];
    categorizedCounts: Record<TransactionType, number>;
  }> {
    console.log('🚀 HyperSync: Starting getBlockTransactions for block:', blockNumber);
    
    // Try both HyperSync endpoints
    const hyperSyncUrls = [MONAD_TESTNET_HYPERSYNC_URL, MONAD_TESTNET_HYPERSYNC_BACKUP_URL];
    
    for (const [index, hyperSyncUrl] of hyperSyncUrls.entries()) {
      try {
        console.log(`📡 HyperSync: Attempting REST API call to: ${hyperSyncUrl} (attempt ${index + 1}/${hyperSyncUrls.length})`);
        
        // Create HyperSync query for the specific block
        const query = {
          from_block: blockNumber,
          to_block: blockNumber + 1,
          field_selection: {
            transaction: [
              'block_number',
              'transaction_index', 
              'hash',
              'from',
              'to',
              'value',
              'input',
              'status',
              'gas',
              'gas_used',
              'gas_price'
            ]
          }
        };

        console.log('📋 HyperSync: Query payload:', JSON.stringify(query, null, 2));

        const response = await fetch(`${hyperSyncUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
        });

        console.log('📨 HyperSync: Response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HyperSync API error: ${response.status} ${response.statusText}`);
        }

        const data: HyperSyncResponse = await response.json();
        console.log('📦 HyperSync: Response data structure:', {
          hasData: !!data.data,
          hasTransactions: !!data.data?.transactions,
          transactionCount: data.data?.transactions?.length || 0,
          nextBlock: data.next_block,
          archiveHeight: data.archive_height,
        });
         
        if (!data.data.transactions || data.data.transactions.length === 0) {
          console.log(`⚠️ HyperSync: No transactions found for block from ${hyperSyncUrl}, trying next endpoint...`);
          continue; // Try next endpoint
        }

        const transactions = data.data.transactions;
        const categorizedCounts: Record<TransactionType, number> = {
          transfer: 0,
          swap: 0,
          mint: 0,
          contract: 0,
          failed: 0,
          other: 0,
        };

        console.log(`✅ HyperSync: Found ${transactions.length} transactions in block ${blockNumber} from ${hyperSyncUrl}`);

        // Categorize each transaction (HyperSync doesn't provide receipts, so we use basic categorization)
        transactions.forEach((tx: any, index: number) => {
          // Log first few transactions to debug
          if (index < 3) {
            console.log(`🔍 HyperSync: Sample transaction ${index}:`, {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              input: tx.input,
              status: tx.status,
              inputLength: tx.input?.length,
              hasInput: !!tx.input,
              hasValue: !!tx.value && tx.value !== '0' && tx.value !== '0x0'
            });
          }
          
          const category = this.categorizeTransaction(tx);
          categorizedCounts[category]++;
          this.cumulativeCounts[category]++; // Update cumulative counters
          
          // Log categorization for first few transactions
          if (index < 3) {
            console.log(`📋 HyperSync: Transaction ${index} categorized as:`, category);
          }
          
          // Special logging for failed transactions
          if (category === 'failed') {
            console.log(`💀 FAILED TRANSACTION DETECTED:`, {
              hash: tx.hash,
              status: tx.status,
              from: tx.from,
              to: tx.to
            });
          }
        });

        console.log('📊 HyperSync: Block categorization:', categorizedCounts);
        console.log('📈 HyperSync: Cumulative counts:', this.cumulativeCounts);

        return {
          transactions,
          categorizedCounts: { ...this.cumulativeCounts }, // Return cumulative counts
        };
      } catch (error) {
        console.error(`❌ HyperSync: Error with ${hyperSyncUrl}:`, error);
        if (index === hyperSyncUrls.length - 1) {
          // Last endpoint failed, fall back to ethers.js
          console.log('🔄 HyperSync: All endpoints failed, falling back to ethers.js for block:', blockNumber);
          return this.getBlockTransactionsFallback(blockNumber);
        }
        // Continue to next endpoint
        continue;
      }
    }
    
    // If we get here, all HyperSync endpoints failed
    console.log('🔄 HyperSync: All HyperSync endpoints failed, falling back to ethers.js for block:', blockNumber);
    return this.getBlockTransactionsFallback(blockNumber);
  }

  /**
   * Fallback method using ethers.js when HyperSync is not available
   */
  private async getBlockTransactionsFallback(blockNumber: number): Promise<{
    transactions: any[];
    categorizedCounts: Record<TransactionType, number>;
  }> {
    console.log('🔄 Fallback: Starting ethers.js fallback for block:', blockNumber);
    
    // Try primary HyperRPC endpoint first, then backup
    const providers = [
      { provider: this.fallbackProvider, url: MONAD_TESTNET_HYPERRPC_URL },
      { provider: this.backupProvider, url: MONAD_TESTNET_HYPERRPC_BACKUP_URL }
    ];
    
    for (const [index, { provider, url }] of providers.entries()) {
      try {
        console.log(`📡 Fallback: Fetching block via ethers.js from: ${url} (attempt ${index + 1}/${providers.length})`);
        const block = await provider.getBlock(blockNumber, false);
      
                if (!block || !block.transactions || block.transactions.length === 0) {
            console.log(`⚠️ Fallback: No real block data or transactions found for block from ${url}, trying next provider...`);
            continue;
          }

          console.log(`📦 Fallback: Found block with ${block.transactions.length} transaction hashes from ${url}`);

          const categorizedCounts: Record<TransactionType, number> = {
            transfer: 0,
            swap: 0,
            mint: 0,
            contract: 0,
            failed: 0,
            other: 0,
          };

          console.log('🔍 Fallback: Fetching detailed transaction data...');
          
          // Rate limit: Process transactions in smaller batches to avoid rate limits
          const batchSize = 10; // Process 10 transactions at a time
          const transactionsWithReceipts: any[] = [];
          
          for (let i = 0; i < block.transactions.length; i += batchSize) {
            const batch = block.transactions.slice(i, i + batchSize);
            console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(block.transactions.length/batchSize)} (${batch.length} transactions)`);
            
            const batchResults = await Promise.all(
              batch.map(async (txHash) => {
                try {
                  const tx = await provider.getTransaction(txHash);
                  const receipt = await provider.getTransactionReceipt(txHash);
                  
                  if (!tx) return null;
                  
                  return {
                    ...tx,
                    status: receipt?.status || 1,
                    contractAddress: receipt?.contractAddress || null,
                    logs: receipt?.logs || [],
                  };
                } catch (error) {
                  console.error('Error getting transaction details for:', txHash, error);
                  return null;
                }
              })
            );
            
            transactionsWithReceipts.push(...batchResults);
            
            // Add a small delay between batches to respect rate limits
            if (i + batchSize < block.transactions.length) {
              await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
            }
          }

          // Filter out null transactions
          const validTransactions = transactionsWithReceipts.filter(tx => tx !== null);
          console.log(`✅ Fallback: Successfully fetched ${validTransactions.length} detailed transactions from ${url}`);

          // Categorize each transaction with receipt data for better accuracy
          validTransactions.forEach((tx: any) => {
            // Extract receipt data from the transaction object (we merged it earlier)
            const receipt = {
              status: tx.status,
              contractAddress: tx.contractAddress,
              logs: tx.logs || []
            };
            
            const category = this.categorizeTransaction(tx, receipt);
            categorizedCounts[category]++;
            this.cumulativeCounts[category]++; // Update cumulative counters
            
            // Special logging for failed transactions
            if (category === 'failed') {
              console.log(`💀 FAILED TRANSACTION DETECTED (Fallback):`, {
                hash: tx.hash,
                status: tx.status,
                receiptStatus: receipt.status,
                from: tx.from,
                to: tx.to
              });
            }
          });

          console.log('📊 Fallback: Block categorization:', categorizedCounts);
          console.log('📈 Fallback: Cumulative counts:', this.cumulativeCounts);

          return {
            transactions: validTransactions,
            categorizedCounts: { ...this.cumulativeCounts }, // Return cumulative counts
          };
        } catch (error) {
          console.error(`❌ Fallback: Error with ${url}:`, error);
          if (index === providers.length - 1) {
            // Last provider failed
            console.log('🚫 Fallback: All providers failed, returning empty results');
            return {
              transactions: [],
              categorizedCounts: {
                transfer: 0,
                swap: 0,
                mint: 0,
                contract: 0,
                failed: 0,
                other: 0,
              }
            };
          }
          // Continue to next provider
          continue;
        }
      }
      
      // If we get here, all providers failed
      console.log('🚫 Fallback: All HyperRPC providers failed, returning empty results');
      return {
        transactions: [],
        categorizedCounts: {
          transfer: 0,
          swap: 0,
          mint: 0,
          contract: 0,
          failed: 0,
          other: 0,
        }
      };
  }

  /**
   * Get the most common transaction type for a block
   */
  async getDominantTransactionType(blockNumber: number): Promise<TransactionType> {
    const { categorizedCounts } = await this.getBlockTransactions(blockNumber);
    
    // Find the transaction type with the highest count
    let dominantType: TransactionType = 'other';
    let maxCount = 0;
    
    Object.entries(categorizedCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type as TransactionType;
      }
    });
    
    return dominantType;
  }

  /**
   * Analyze a single transaction by hash
   */
  async analyzeTransaction(txHash: string): Promise<{
    transaction: any;
    category: TransactionType;
  } | null> {
    try {
      // Try HyperSync REST API first
      const query: HyperSyncQuery = {
        from_block: 0,
        transactions: [{}], // Get all transactions, then filter by hash in response
        field_selection: {
          transaction: [
            'block_number',
            'transaction_index',
            'hash',
            'from',
            'to',
            'value',
            'input',
            'status',
            'gas',
            'gas_used',
            'gas_price'
          ]
        }
      };

      const response = await fetch(`${MONAD_TESTNET_HYPERSYNC_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (response.ok) {
        const data: HyperSyncResponse = await response.json();
        
        if (data.data.transactions && data.data.transactions.length > 0) {
          // Filter for the specific transaction hash
          const tx = data.data.transactions.find(t => t.hash === txHash);
          if (tx) {
            const category = this.categorizeTransaction(tx);
            return { transaction: tx, category };
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing transaction with HyperSync:', txHash, error);
    }

    // Fallback to ethers.js
    try {
      const tx = await this.fallbackProvider.getTransaction(txHash);
      const receipt = await this.fallbackProvider.getTransactionReceipt(txHash);
      
      if (!tx) {
        return null;
      }

      const txWithStatus = {
        ...tx,
        status: receipt?.status || 1,
        contractAddress: receipt?.contractAddress || null,
        logs: receipt?.logs || [],
      };

      const receiptData = {
        status: receipt?.status || 1,
        contractAddress: receipt?.contractAddress || null,
        logs: receipt?.logs || []
      };

      const category = this.categorizeTransaction(txWithStatus, receiptData);

      return {
        transaction: txWithStatus,
        category,
      };
    } catch (error) {
      console.error('Error analyzing transaction with fallback:', txHash, error);
      return null;
    }
  }
}

// Export singleton instance
export const hyperSyncService = new MonadHyperSyncService();
