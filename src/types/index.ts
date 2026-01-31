export interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  personality: 'aggressive' | 'conservative' | 'random' | 'whale' | 'sniper';
  balance: number;
  pnl: number;
  winRate: number;
  totalTrades: number;
  holdings: Record<string, number>;
}

export interface Token {
  id: string;
  name: string;
  ticker: string;
  emoji: string;
  description: string;
  creatorId: string;
  createdAt: number;
  marketCap: number;
  price: number;
  initialPrice: number; // Starting price to calculate % change
  priceChange24h: number;
  volume24h: number;
  supply: number;
  reserveBalance: number;
  graduated: boolean;
}

export interface Trade {
  id: string;
  agentId: string;
  tokenId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  cost: number; // Total MON spent (buy) or received (sell)
  timestamp: number;
  txHash: string;
}

export interface BondingCurve {
  tokenId: string;
  reserveRatio: number;
  basePrice: number;
  currentSupply: number;
  reserveBalance: number;
}
