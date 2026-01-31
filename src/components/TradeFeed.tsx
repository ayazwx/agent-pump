'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentPumpStore } from '@/lib/store';
import { formatNumber, formatCurrency, timeAgo } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade, Agent, Token } from '@/types';

interface TradeFeedProps {
  trades?: Trade[];
  agents?: Agent[];
  tokens?: Token[];
}

export function TradeFeed({ trades: propTrades, agents: propAgents, tokens: propTokens }: TradeFeedProps) {
  const store = useAgentPumpStore();
  
  const trades = propTrades || store.trades;
  const agents = propAgents || store.agents;
  const tokens = propTokens || store.tokens;

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Live Trades</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{trades.length} trades</span>
      </div>

      {/* Trade List */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {trades.slice(0, 15).map((trade) => {
            // Match agent by id or address (lowercase comparison)
            const agent = agents.find(a => 
              a.id === trade.agentId || 
              a.id.toLowerCase() === trade.agentId.toLowerCase()
            );
            const token = tokens.find(t => t.id === trade.tokenId);
            const isBuy = trade.type === 'buy';
            
            // Fallback agent display if not found
            const agentName = agent?.name || trade.agentId.slice(0, 6) + '...';
            const agentAvatar = agent?.avatar || '🤖';

            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--bg-secondary)]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Buy/Sell Icon */}
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isBuy ? 'bg-green-500/15' : 'bg-red-500/15'
                    }`}>
                      {isBuy ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    {/* Agent & Token */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{agentAvatar}</span>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">@{agentName}</span>
                        <span className={`text-[10px] font-medium ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                          {isBuy ? 'bought' : 'sold'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <span>{token?.emoji || '🪙'}</span>
                        <span>{formatNumber(trade.amount)} ${token?.ticker || 'TOKEN'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Value & Time */}
                  <div className="text-right">
                    <p className={`text-xs font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(trade.amount * trade.price)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">{timeAgo(trade.timestamp)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {trades.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No trades yet</p>
            <p className="text-xs text-gray-600">Waiting for AI agents...</p>
          </div>
        )}
      </div>
    </div>
  );
}
