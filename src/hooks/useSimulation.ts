'use client';

import { useEffect, useRef } from 'react';
import { useAgentPumpStore } from '@/lib/store';
import { getRandomAgent, shouldAgentTrade, getTradeAmount } from '@/lib/agents';

export function useSimulation() {
  const { tokens, isSimulating, executeTrade, createToken } = useAgentPumpStore();
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!isSimulating) {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      return;
    }

    // Clear any existing intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    // TRADE INTERVALS - Multiple parallel trade loops for high activity
    
    // Fast trades every 100-300ms (aggressive traders)
    const fastTradeInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length === 0) return;

      for (let i = 0; i < 3; i++) { // 3 trades per tick
        const agent = getRandomAgent();
        const token = currentTokens[Math.floor(Math.random() * currentTokens.length)];
        if (token.graduated) continue;

        const decision = shouldAgentTrade(agent, token.price, token.priceChange24h);
        if (decision.should) {
          const amount = getTradeAmount(agent, decision.type);
          executeTrade(agent.id, token.id, decision.type, amount);
        }
      }
    }, 150 + Math.random() * 150);
    intervalsRef.current.push(fastTradeInterval);

    // Medium trades every 300-600ms
    const mediumTradeInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length === 0) return;

      for (let i = 0; i < 2; i++) {
        const agent = getRandomAgent();
        const token = currentTokens[Math.floor(Math.random() * currentTokens.length)];
        if (token.graduated) continue;

        const decision = shouldAgentTrade(agent, token.price, token.priceChange24h);
        if (decision.should) {
          const amount = getTradeAmount(agent, decision.type);
          executeTrade(agent.id, token.id, decision.type, amount);
        }
      }
    }, 300 + Math.random() * 300);
    intervalsRef.current.push(mediumTradeInterval);

    // SELL INTERVAL - Agents with holdings sell their tokens
    const sellInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      const agents = useAgentPumpStore.getState().agents;
      if (currentTokens.length === 0) return;

      // Find agents with holdings
      const agentsWithHoldings = agents.filter(a => {
        const totalHoldings = Object.values(a.holdings).reduce((sum, h) => sum + h, 0);
        return totalHoldings > 0;
      });

      if (agentsWithHoldings.length === 0) return;

      // Pick random agent with holdings
      const agent = agentsWithHoldings[Math.floor(Math.random() * agentsWithHoldings.length)];
      
      // Find a token they own
      const ownedTokenIds = Object.keys(agent.holdings).filter(id => agent.holdings[id] > 0);
      if (ownedTokenIds.length === 0) return;

      const tokenId = ownedTokenIds[Math.floor(Math.random() * ownedTokenIds.length)];
      const token = currentTokens.find(t => t.id === tokenId);
      if (!token || token.graduated) return;

      // Execute sell
      const holdingAmount = agent.holdings[tokenId];
      const sellAmount = holdingAmount * (0.1 + Math.random() * 0.4); // Sell 10-50% of holdings
      executeTrade(agent.id, tokenId, 'sell', sellAmount);
    }, 200 + Math.random() * 300); // Frequent sells
    intervalsRef.current.push(sellInterval);

    // Whale trades every 1-2 seconds
    const whaleTradeInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      const agents = useAgentPumpStore.getState().agents;
      if (currentTokens.length === 0) return;

      // Find whale agents
      const whales = agents.filter(a => a.personality === 'whale');
      if (whales.length === 0) return;

      const whale = whales[Math.floor(Math.random() * whales.length)];
      const token = currentTokens[Math.floor(Math.random() * currentTokens.length)];
      if (token.graduated) return;

      const decision = shouldAgentTrade(whale, token.price, token.priceChange24h);
      if (decision.should) {
        const amount = getTradeAmount(whale, decision.type) * 2; // Whales trade bigger
        executeTrade(whale.id, token.id, decision.type, amount);
      }
    }, 1000 + Math.random() * 1000);
    intervalsRef.current.push(whaleTradeInterval);

    // TOKEN CREATION INTERVALS - Different agents create at different rates
    
    // Very fast token creation (1-2 seconds)
    const fastCreateInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length >= 200) return; // Cap at 200 tokens
      
      const agent = getRandomAgent();
      createToken(agent.id);
    }, 1000 + Math.random() * 1000);
    intervalsRef.current.push(fastCreateInterval);

    // Medium token creation (2-4 seconds)
    const mediumCreateInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length >= 200) return;
      
      const agent = getRandomAgent();
      createToken(agent.id);
    }, 2000 + Math.random() * 2000);
    intervalsRef.current.push(mediumCreateInterval);

    // Slow token creation (5-10 seconds)
    const slowCreateInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length >= 200) return;
      
      const agent = getRandomAgent();
      createToken(agent.id);
    }, 5000 + Math.random() * 5000);
    intervalsRef.current.push(slowCreateInterval);

    // PRICE MANIPULATION - Create pumps and dumps
    const priceManipulationInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length === 0) return;

      // Pick a random token to pump or dump
      const token = currentTokens[Math.floor(Math.random() * currentTokens.length)];
      if (token.graduated) return;

      const isPump = Math.random() > 0.35; // 65% chance of pump
      const numTrades = 5 + Math.floor(Math.random() * 10); // 5-15 coordinated trades

      for (let i = 0; i < numTrades; i++) {
        setTimeout(() => {
          const agent = getRandomAgent();
          // Bigger trades for more price impact
          const amount = getTradeAmount(agent, isPump ? 'buy' : 'sell') * (2 + Math.random() * 3);
          executeTrade(agent.id, token.id, isPump ? 'buy' : 'sell', amount);
        }, i * 30); // Faster stagger
      }
    }, 2000 + Math.random() * 3000); // More frequent manipulation
    intervalsRef.current.push(priceManipulationInterval);

    // MEGA PUMP - Occasional massive coordinated buy
    const megaPumpInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length === 0) return;

      // Pick a lower market cap token to pump
      const sortedByMc = [...currentTokens].sort((a, b) => a.marketCap - b.marketCap);
      const token = sortedByMc[Math.floor(Math.random() * Math.min(10, sortedByMc.length))];
      if (token.graduated) return;

      // 20-30 rapid buys to create a massive pump
      const numBuys = 20 + Math.floor(Math.random() * 10);
      for (let i = 0; i < numBuys; i++) {
        setTimeout(() => {
          const agent = getRandomAgent();
          const amount = getTradeAmount(agent, 'buy') * (3 + Math.random() * 5);
          executeTrade(agent.id, token.id, 'buy', amount);
        }, i * 20);
      }
    }, 8000 + Math.random() * 7000); // Every 8-15 seconds
    intervalsRef.current.push(megaPumpInterval);

    // DUMP EVENT - Occasional massive sell-off
    const dumpEventInterval = setInterval(() => {
      const currentTokens = useAgentPumpStore.getState().tokens;
      if (currentTokens.length === 0) return;

      // Pick a higher priced token to dump
      const pumpedTokens = currentTokens.filter(t => t.priceChange24h > 50);
      if (pumpedTokens.length === 0) return;

      const token = pumpedTokens[Math.floor(Math.random() * pumpedTokens.length)];
      if (token.graduated) return;

      // 10-20 sells to create a dump
      const numSells = 10 + Math.floor(Math.random() * 10);
      for (let i = 0; i < numSells; i++) {
        setTimeout(() => {
          const agent = getRandomAgent();
          const amount = getTradeAmount(agent, 'sell') * (2 + Math.random() * 3);
          executeTrade(agent.id, token.id, 'sell', amount);
        }, i * 25);
      }
    }, 12000 + Math.random() * 8000); // Every 12-20 seconds
    intervalsRef.current.push(dumpEventInterval);

    return () => {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
    };
  }, [isSimulating, executeTrade, createToken]);
}
