'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { monadTestnet, CONTRACT_ADDRESS, AGENT_PUMP_ABI } from './wagmi';
import { Token, Agent, Trade } from '@/types';

// Create public client for reading blockchain with faster timeout
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(undefined, {
    timeout: 10000, // 10 second timeout (reduced)
    retryCount: 2,
    retryDelay: 500,
  }),
});


// Known agent wallets for fallback display
const KNOWN_AGENTS: Record<string, { name: string; avatar: string; personality: string }> = {
  '0xcAddBB9c29882Db33607a9F667404e0F1e7fc803': { name: 'Claude', avatar: '🧠', personality: 'conservative' },
  '0x9343f26Bfd351c4595e6a4839F7F86f770c1860D': { name: 'GPT-4', avatar: '🤖', personality: 'aggressive' },
  '0x98e4e8BBD04EA3c30015d100Caa7C55bAa4698Fd': { name: 'Gemini', avatar: '💎', personality: 'aggressive' },
  '0x73f2a6043Db38195975C0f98120BEE1760a2Ba5C': { name: 'Llama', avatar: '🦙', personality: 'whale' },
  '0xc59bD59d3fB6AEe0e08E4b7C440F5291C50F325c': { name: 'Mistral', avatar: '🌪️', personality: 'sniper' },
  '0xF6Ee7FFef9B6001d5B4ABEdBE5D3366E929Dd5B0': { name: 'DeepSeek', avatar: '🔍', personality: 'aggressive' },
  '0xbA3898E890733070fA7325f089fcACbdb6DbD1E1': { name: 'Qwen', avatar: '🐉', personality: 'conservative' },
  '0xdfb9d7AfEC2fE8d358B95c0a96b19A511Ef50d16': { name: 'Grok', avatar: '👽', personality: 'random' },
};

export interface BlockchainState {
  tokens: Token[];
  agents: Agent[];
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
}

// Cache for data - reset on page load
let cachedTokens: Token[] = [];
let cachedAgents: Agent[] = [];
let cachedTrades: Trade[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache to reduce RPC calls

// Clear cache on module load (fresh start)
if (typeof window !== 'undefined') {
  cachedTokens = [];
  cachedAgents = [];
  cachedTrades = [];
  lastFetchTime = 0;
}

export function useBlockchainData() {
  const [state, setState] = useState<BlockchainState>({
    tokens: cachedTokens,
    agents: cachedAgents,
    trades: cachedTrades,
    isLoading: cachedTokens.length === 0,
    error: null,
  });

  const fetchTokens = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return [];

    try {
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AGENT_PUMP_ABI,
        functionName: 'tokenCount',
      });

      const tokenCount = Number(count);
      if (tokenCount === 0) return [];

      let failCount = 0;

      // Fetch tokens in smaller batches with delay to avoid rate limiting
      const batchSize = 3; // Small batch size to avoid 413/429
      const tokens: Token[] = [];

      for (let batch = 0; batch < Math.ceil(tokenCount / batchSize); batch++) {
        const start = batch * batchSize;
        const end = Math.min(start + batchSize, tokenCount);

        // Add delay between batches to avoid 429 errors
        if (batch > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
        
        const promises = [];
        for (let i = start; i < end; i++) {
          promises.push(
            publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: AGENT_PUMP_ABI,
              functionName: 'getToken',
              args: [BigInt(i)],
            }).then(data => ({ index: i, data, error: null }))
              .catch(error => ({ index: i, data: null, error }))
          );
        }
        
        const results = await Promise.all(promises);
        
        for (const result of results) {
          if (result.error || !result.data) {
            failCount++;
            continue;
          }
          
          const [name, symbol, metadata, creator, createdAt, totalSupply, reserveBalance, price, marketCap, graduated] = result.data as any;
          
          let emoji = '🪙';
          let description = '';
          try {
            const meta = JSON.parse(metadata);
            emoji = meta.emoji || '🪙';
            description = meta.description || '';
          } catch {}

          const currentPrice = Number(price) / 1e18;
          const basePrice = 0.0001; // Initial bonding curve price
          const priceChange = basePrice > 0 ? ((currentPrice - basePrice) / basePrice) * 100 : 0;

          tokens.push({
            id: result.index.toString(),
            name,
            ticker: symbol,
            emoji,
            description,
            creatorId: creator,
            createdAt: Number(createdAt) * 1000,
            marketCap: Number(marketCap) / 1e18,
            price: currentPrice,
            priceChange24h: priceChange,
            volume24h: 0,
            supply: Number(totalSupply) / 1e18,
            reserveBalance: Number(reserveBalance) / 1e18,
            graduated: Boolean(graduated),
          });
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return cachedTokens; // Return cached on error
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return [];

    try {
      // Try getAllAgents first
      let agentAddresses: string[] = [];
      try {
        agentAddresses = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: AGENT_PUMP_ABI,
          functionName: 'getAllAgents',
        }) as string[];
      } catch (e) {
        // Fallback: extract unique creators from tokens
        const tokenCount = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: AGENT_PUMP_ABI,
          functionName: 'tokenCount',
        });
        
        const uniqueCreators = new Set<string>();
        for (let i = 0; i < Number(tokenCount); i++) {
          try {
            const data = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: AGENT_PUMP_ABI,
              functionName: 'getToken',
              args: [BigInt(i)],
            }) as any[];
            uniqueCreators.add(data[3]); // creator address
          } catch {}
        }
        agentAddresses = Array.from(uniqueCreators);
      }

      if (!agentAddresses || agentAddresses.length === 0) return [];

      // Fetch all agent info and balances in parallel
      const agentPromises = agentAddresses.map(async (address) => {
        // Always fetch balance separately so it doesn't fail with getAgentInfo
        let balance = 0;
        try {
          const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
          balance = Number(balanceWei) / 1e18;
        } catch {
          // Balance fetch failed
        }

        // Try to get agent info from contract
        try {
          const data = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: AGENT_PUMP_ABI,
            functionName: 'getAgentInfo',
            args: [address],
          });
          return { address, data, balance, error: null };
        } catch (error) {
          return { address, data: null, balance, error };
        }
      });

      const agentResults = await Promise.all(agentPromises);
      const agents: Agent[] = [];

      for (const result of agentResults) {
        // Get known agent info as fallback
        const knownAgent = KNOWN_AGENTS[result.address] || KNOWN_AGENTS[result.address.toLowerCase()];

        if (result.error || !result.data) {
          // Create agent entry using known info or defaults
          agents.push({
            id: result.address,
            name: knownAgent?.name || result.address.slice(0, 8),
            avatar: knownAgent?.avatar || '🤖',
            color: '#2563eb',
            personality: knownAgent?.personality || 'random',
            balance: result.balance,
            pnl: 0,
            winRate: 0,
            totalTrades: 0,
            holdings: {},
          });
          continue;
        }

        const [name, avatar, totalTrades, totalVolume, pnl, active] = result.data as any;

        agents.push({
          id: result.address,
          name: name || knownAgent?.name || result.address.slice(0, 8),
          avatar: avatar || knownAgent?.avatar || '🤖',
          color: '#2563eb',
          personality: knownAgent?.personality || 'random',
          balance: result.balance,
          pnl: Number(pnl) / 1e18,
          winRate: Number(totalTrades) > 0 ? 50 : 0,
          totalTrades: Number(totalTrades),
          holdings: {},
        });
      }

      return agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      return cachedAgents;
    }
  }, []);

  // Fetch past trades from events - optimized for Monad's 100 block limit
  const fetchPastTrades = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return [];

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const allTrades: Trade[] = [];

      // Monad RPC limits: 100 blocks per request, rate limited
      // Fetch last 1000 blocks in batches of 50 with delays
      const batchSize = 50n;
      const totalBlocks = 1000n; // Reduced from 5000
      const startBlock = currentBlock > totalBlocks ? currentBlock - totalBlocks : 0n;

      for (let from = startBlock; from < currentBlock; from += batchSize) {
        const to = from + batchSize > currentBlock ? currentBlock : from + batchSize;

        // Add delay between batches
        if (from > startBlock) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        try {
          const logs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS as `0x${string}`,
            event: parseAbiItem('event Trade(uint256 indexed tokenId, address indexed agent, bool isBuy, uint256 amount, uint256 price, uint256 cost)'),
            fromBlock: from,
            toBlock: to,
          });

          for (const log of logs) {
            const args = log.args as any;
            const tradeCost = Number(args.cost || 0) / 1e18;
            const tradeAmount = Number(args.amount || 0) / 1e18;
            const tradePrice = Number(args.price || 0) / 1e18;

            allTrades.push({
              id: log.transactionHash || `trade-${allTrades.length}`,
              agentId: args.agent,
              tokenId: args.tokenId.toString(),
              type: args.isBuy ? 'buy' : 'sell',
              amount: tradeAmount,
              price: tradePrice,
              cost: tradeCost > 0 ? tradeCost : tradeAmount * tradePrice,
              timestamp: Date.now() - (allTrades.length + 1) * 1000,
              txHash: log.transactionHash || '',
            });
          }
        } catch {
          // Skip failed batches silently
        }
      }

      return allTrades.reverse();
    } catch (error) {
      console.error('Error fetching past trades:', error);
      return cachedTrades;
    }
  }, []);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!CONTRACT_ADDRESS) {
      setState(prev => ({ ...prev, isLoading: false, error: 'No contract address' }));
      return;
    }

    // Check cache
    const now = Date.now();
    if (cachedTokens.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      setState({
        tokens: cachedTokens,
        agents: cachedAgents,
        trades: cachedTrades,
        isLoading: false,
        error: null,
      });
      return;
    }
    
    if (showLoading && cachedTokens.length === 0) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }
    
    try {
      
      const [tokens, agents, trades] = await Promise.all([
        fetchTokens(),
        fetchAgents(),
        fetchPastTrades(),
      ]);


      // Calculate token volumes from trades (use cost for accurate volume)
      const tokenVolumeMap = new Map<string, number>();
      for (const trade of trades) {
        const tradeCost = trade.cost || (trade.amount * trade.price);
        const volume = tokenVolumeMap.get(trade.tokenId) || 0;
        tokenVolumeMap.set(trade.tokenId, volume + tradeCost);
      }

      // Update tokens with volume
      const updatedTokens = tokens.map(token => ({
        ...token,
        volume24h: tokenVolumeMap.get(token.id) || 0,
      }));

      // Calculate agent stats from trades (case-insensitive)
      const agentTradeStats = new Map<string, {
        trades: number;
        buys: number;
        sells: number;
        totalSpent: number;    // MON spent on buys
        totalReceived: number; // MON received from sells
        holdings: Record<string, number>;
        costBasis: Record<string, number>; // Track cost per token
      }>();

      for (const trade of trades) {
        const agentIdLower = trade.agentId.toLowerCase();
        const stats = agentTradeStats.get(agentIdLower) || {
          trades: 0, buys: 0, sells: 0,
          totalSpent: 0, totalReceived: 0,
          holdings: {},
          costBasis: {}
        };

        stats.trades++;
        const tradeCost = trade.cost || (trade.amount * trade.price);

        if (trade.type === 'buy') {
          stats.buys++;
          stats.totalSpent += tradeCost;
          stats.holdings[trade.tokenId] = (stats.holdings[trade.tokenId] || 0) + trade.amount;
          stats.costBasis[trade.tokenId] = (stats.costBasis[trade.tokenId] || 0) + tradeCost;
        } else {
          stats.sells++;
          stats.totalReceived += tradeCost;
          stats.holdings[trade.tokenId] = (stats.holdings[trade.tokenId] || 0) - trade.amount;
        }

        agentTradeStats.set(agentIdLower, stats);
      }

      // Calculate unrealized P&L from current holdings
      const tokenPriceMap = new Map<string, number>();
      for (const token of updatedTokens) {
        tokenPriceMap.set(token.id, token.price);
      }

      // Update agents with trade stats and P&L
      const updatedAgents = agents.map(agent => {
        const stats = agentTradeStats.get(agent.id.toLowerCase());
        if (stats) {
          // Calculate current value of holdings
          let holdingsValue = 0;
          for (const [tokenId, amount] of Object.entries(stats.holdings)) {
            if (amount > 0) {
              const currentPrice = tokenPriceMap.get(tokenId) || 0;
              holdingsValue += amount * currentPrice;
            }
          }

          // P&L = (MON received from sells) + (current value of holdings) - (MON spent on buys)
          const totalPnl = stats.totalReceived + holdingsValue - stats.totalSpent;


          return {
            ...agent,
            totalTrades: stats.trades,
            winRate: stats.trades > 0 ? Math.round((stats.sells / stats.trades) * 100) : 0,
            pnl: totalPnl,
            holdings: stats.holdings,
          };
        }
        return agent;
      });

      // Update cache
      cachedTokens = updatedTokens;
      cachedAgents = updatedAgents;
      cachedTrades = trades;
      lastFetchTime = Date.now();

      setState({
        tokens: updatedTokens,
        agents: updatedAgents,
        trades,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('fetchData error:', error);
      // On error, use cached data if available
      if (cachedTokens.length > 0) {
        setState({
          tokens: cachedTokens,
          agents: cachedAgents,
          trades: cachedTrades,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch data',
        }));
      }
    }
  }, [fetchTokens, fetchAgents, fetchPastTrades]);

  // Watch for Trade events
  useEffect(() => {
    if (!CONTRACT_ADDRESS) return;

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: AGENT_PUMP_ABI,
      eventName: 'Trade',
      onLogs: (logs) => {
        for (const log of logs) {
          const { tokenId, agent, isBuy, amount, price, cost } = log.args as any;
          
          const trade: Trade = {
            id: log.transactionHash || Math.random().toString(),
            agentId: agent,
            tokenId: tokenId.toString(),
            type: isBuy ? 'buy' : 'sell',
            amount: Number(amount) / 1e18,
            price: Number(price) / 1e18,
            cost: Number(cost) / 1e18,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
          };

          setState(prev => {
            // Update agent trade count
            const updatedAgents = prev.agents.map(a => {
              if (a.id.toLowerCase() === agent.toLowerCase()) {
                return {
                  ...a,
                  totalTrades: a.totalTrades + 1,
                };
              }
              return a;
            });

            return {
              ...prev,
              trades: [trade, ...prev.trades].slice(0, 100),
              agents: updatedAgents,
            };
          });
        }

        // Refetch tokens to update prices
        fetchTokens().then(tokens => {
          setState(prev => ({ ...prev, tokens }));
        });
      },
    });

    return () => unwatch();
  }, [fetchTokens]);

  // Watch for TokenCreated events
  useEffect(() => {
    if (!CONTRACT_ADDRESS) return;

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: AGENT_PUMP_ABI,
      eventName: 'TokenCreated',
      onLogs: () => {
        // Refetch all tokens - use ref to avoid dependency
        fetchTokens().then(tokens => {
          setState(prev => ({ ...prev, tokens }));
        });
      },
    });

    return () => unwatch();
  }, [fetchTokens]);

  // Initial fetch - only run once on mount
  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchData();
    
    // Poll every 60 seconds as backup (reduced frequency)
    const interval = setInterval(() => {
      fetchTokens().then(tokens => {
        if (tokens.length > 0) {
          setState(prev => ({ ...prev, tokens }));
        }
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    refetch: fetchData,
  };
}
