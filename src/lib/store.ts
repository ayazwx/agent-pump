import { create } from 'zustand';
import { Agent, Token, Trade } from '@/types';
import { AI_AGENTS, getRandomAgent, getRandomTokenInfo, generateTxHash, shouldAgentTrade, getTradeAmount } from './agents';
import { calculateBuyPrice, calculateSellPrice, calculateMarketCap, BASE_PRICE, isGraduated } from './bonding-curve';

interface AgentPumpState {
  agents: Agent[];
  tokens: Token[];
  trades: Trade[];
  selectedToken: Token | null;
  isSimulating: boolean;

  setSelectedToken: (token: Token | null) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  createToken: (agentId: string) => void;
  executeTrade: (agentId: string, tokenId: string, type: 'buy' | 'sell', amount: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAgentPumpStore = create<AgentPumpState>((set, get) => ({
  agents: AI_AGENTS.map(a => ({ ...a })),
  tokens: [],
  trades: [],
  selectedToken: null,
  isSimulating: false,

  setSelectedToken: (token) => set({ selectedToken: token }),

  startSimulation: () => {
    set({ isSimulating: true });

    // Create initial burst of tokens (10 tokens quickly)
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const agents = AI_AGENTS;
        const agent = agents[Math.floor(Math.random() * agents.length)];
        get().createToken(agent.id);
      }, i * 200);
    }
  },

  stopSimulation: () => set({ isSimulating: false }),

  createToken: (agentId) => {
    const tokenInfo = getRandomTokenInfo();
    const existingTickers = get().tokens.map(t => t.ticker);

    if (existingTickers.includes(tokenInfo.ticker)) {
      tokenInfo.ticker = tokenInfo.ticker + Math.floor(Math.random() * 100);
    }

    const initialSupply = 1000000;
    const initialReserve = initialSupply * BASE_PRICE * 0.5;

    const token: Token = {
      id: generateId(),
      name: tokenInfo.name,
      ticker: tokenInfo.ticker,
      emoji: tokenInfo.emoji,
      description: tokenInfo.description,
      creatorId: agentId,
      createdAt: Date.now(),
      marketCap: calculateMarketCap(initialSupply, BASE_PRICE),
      price: BASE_PRICE,
      initialPrice: BASE_PRICE, // Store initial price for % calc
      priceChange24h: 0,
      volume24h: 0,
      supply: initialSupply,
      reserveBalance: initialReserve,
      graduated: false,
    };

    const trade: Trade = {
      id: generateId(),
      agentId,
      tokenId: token.id,
      type: 'buy',
      amount: 100000,
      price: BASE_PRICE,
      cost: 100000 * BASE_PRICE,
      timestamp: Date.now(),
      txHash: generateTxHash(),
    };

    // Give creator initial holdings so they can sell later
    const creatorHoldings = 100000;

    set(state => ({
      tokens: [token, ...state.tokens],
      trades: [trade, ...state.trades].slice(0, 500),
      agents: state.agents.map(a =>
        a.id === agentId
          ? {
              ...a,
              holdings: {
                ...a.holdings,
                [token.id]: creatorHoldings,
              },
            }
          : a
      ),
    }));
  },

  executeTrade: (agentId, tokenId, type, amount) => {
    const { tokens, agents } = get();
    const token = tokens.find(t => t.id === tokenId);
    const agent = agents.find(a => a.id === agentId);

    if (!token || !agent || token.graduated) return;

    let newPrice: number;
    let tradeValue: number;

    if (type === 'buy') {
      const result = calculateBuyPrice(token.supply, token.reserveBalance, amount);
      newPrice = result.newPrice;
      tradeValue = result.cost;

      if (tradeValue > agent.balance) return;

      // Calculate if this is a good buy (buying at a dip)
      const isGoodBuy = token.priceChange24h < 0;

      set(state => ({
        tokens: state.tokens.map(t =>
          t.id === tokenId
            ? {
                ...t,
                supply: t.supply + amount,
                reserveBalance: t.reserveBalance + tradeValue,
                price: newPrice,
                marketCap: calculateMarketCap(t.supply + amount, newPrice),
                priceChange24h: ((newPrice - t.initialPrice) / t.initialPrice) * 100, // Use initial price
                volume24h: t.volume24h + tradeValue,
                graduated: isGraduated(calculateMarketCap(t.supply + amount, newPrice)),
              }
            : t
        ),
        agents: state.agents.map(a =>
          a.id === agentId
            ? {
                ...a,
                balance: a.balance - tradeValue,
                holdings: {
                  ...a.holdings,
                  [tokenId]: (a.holdings[tokenId] || 0) + amount,
                },
                totalTrades: a.totalTrades + 1,
                // Potential PnL based on buy timing
                pnl: a.pnl + (isGoodBuy ? tradeValue * 0.05 : -tradeValue * 0.02),
                winRate: isGoodBuy 
                  ? Math.min(99, a.winRate + Math.random() * 0.5)
                  : Math.max(1, a.winRate - Math.random() * 0.3),
              }
            : a
        ),
      }));
    } else {
      const agentHoldings = agent.holdings[tokenId] || 0;
      const sellAmount = Math.min(amount, agentHoldings);
      if (sellAmount <= 0) return;

      const result = calculateSellPrice(token.supply, token.reserveBalance, sellAmount);
      newPrice = result.newPrice;
      tradeValue = result.revenue;

      // Calculate actual profit/loss
      const avgBuyPrice = BASE_PRICE * 1.5; // Simplified avg
      const profit = tradeValue - (sellAmount * avgBuyPrice);
      const isWin = profit > 0;

      set(state => ({
        tokens: state.tokens.map(t =>
          t.id === tokenId
            ? {
                ...t,
                supply: t.supply - sellAmount,
                reserveBalance: Math.max(0, t.reserveBalance - tradeValue),
                price: newPrice,
                marketCap: calculateMarketCap(t.supply - sellAmount, newPrice),
                priceChange24h: ((newPrice - t.initialPrice) / t.initialPrice) * 100, // Use initial price
                volume24h: t.volume24h + tradeValue,
              }
            : t
        ),
        agents: state.agents.map(a =>
          a.id === agentId
            ? {
                ...a,
                balance: a.balance + tradeValue,
                holdings: {
                  ...a.holdings,
                  [tokenId]: Math.max(0, agentHoldings - sellAmount),
                },
                totalTrades: a.totalTrades + 1,
                pnl: a.pnl + profit,
                winRate: isWin 
                  ? Math.min(99, a.winRate + Math.random() * 0.8)
                  : Math.max(1, a.winRate - Math.random() * 0.5),
              }
            : a
        ),
      }));
    }

    const trade: Trade = {
      id: generateId(),
      agentId,
      tokenId,
      type,
      amount: type === 'buy' ? amount : Math.min(amount, agent.holdings[tokenId] || 0),
      price: newPrice,
      cost: tradeValue,
      timestamp: Date.now(),
      txHash: generateTxHash(),
    };

    set(state => ({
      trades: [trade, ...state.trades].slice(0, 500), // Keep more trades
      selectedToken: state.selectedToken?.id === tokenId
        ? state.tokens.find(t => t.id === tokenId) || null
        : state.selectedToken,
    }));
  },
}));
