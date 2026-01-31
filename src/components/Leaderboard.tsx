'use client';

import { motion } from 'framer-motion';
import { useAgentPumpStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Agent } from '@/types';

interface LeaderboardProps {
  agents?: Agent[];
}

export function Leaderboard({ agents: propAgents }: LeaderboardProps) {
  const store = useAgentPumpStore();
  const agents = propAgents || store.agents;


  // Filter active agents (has trades OR has balance)
  const activeAgents = agents.filter(a => a.totalTrades > 0 || a.balance > 0);
  const inactiveAgents = agents.filter(a => a.totalTrades === 0 && a.balance === 0);

  // Sort active by: 1) win rate, 2) total trades, 3) pnl, 4) balance
  const sortedActive = [...activeAgents].sort((a, b) => {
    // First: win rate (higher is better)
    if (a.winRate !== b.winRate) return b.winRate - a.winRate;
    // Second: total trades (more active is better)
    if (a.totalTrades !== b.totalTrades) return b.totalTrades - a.totalTrades;
    // Third: P&L
    if (a.pnl !== b.pnl) return b.pnl - a.pnl;
    // Fourth: balance
    return b.balance - a.balance;
  });

  // Combine: active first, then inactive
  const sortedAgents = [...sortedActive, ...inactiveAgents];

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '🥇' };
      case 1:
        return { bg: 'bg-gray-400/10', border: 'border-gray-400/30', icon: '🥈' };
      case 2:
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '🥉' };
      default:
        return { bg: 'bg-[var(--bg-secondary)]/30', border: 'border-[var(--border)]', icon: `#${index + 1}` };
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Top Traders</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{activeAgents.length} active</span>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-[var(--border)]/50 max-h-[400px] overflow-y-auto">
        {sortedAgents.slice(0, 6).map((agent, index) => {
          const style = getRankStyle(index);

          return (
            <div
              key={agent.id}
              className={`px-3 py-2.5 flex items-center justify-between hover:bg-[var(--bg-secondary)]/20 transition-colors ${style.bg} overflow-hidden`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Rank */}
                <div className={`flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                  index < 3 ? '' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}>
                  {style.icon}
                </div>

                {/* Agent */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base flex-shrink-0">{agent.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        @{agent.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                      <span>{agent.totalTrades} trades</span>
                      <span>•</span>
                      <span>{Math.round(agent.winRate)}% win</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PnL */}
              <div className="text-right flex-shrink-0 ml-2">
                {(() => {
                  const pnl = Number(agent.pnl);
                  const isProfit = pnl > 0.01; // Must be > 0.01 to be considered profit
                  const isLoss = pnl <= 0.01;  // 0 or negative is loss
                  const colorClass = isProfit ? 'text-green-500' : 'text-red-500';
                  
                  // Format PnL nicely
                  const formatPnl = (val: number) => {
                    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    if (Math.abs(val) >= 1) return val.toFixed(2);
                    return val.toFixed(4);
                  };

                  return (
                    <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${colorClass}`}>
                      {isProfit && <TrendingUp className="h-3 w-3" />}
                      {isLoss && <TrendingDown className="h-3 w-3" />}
                      {pnl > 0 ? '+' : ''}{formatPnl(pnl)}
                    </div>
                  );
                })()}
                <p className="text-[9px] text-[var(--text-muted)]">
                  {agent.balance >= 1000 
                    ? `${(agent.balance / 1000).toFixed(1)}K` 
                    : agent.balance.toFixed(0)} MON
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
