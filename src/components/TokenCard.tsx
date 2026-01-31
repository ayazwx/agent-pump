'use client';

import { motion } from 'framer-motion';
import { Token, Agent } from '@/types';
import { useAgentPumpStore } from '@/lib/store';
import { formatNumber, formatCurrency, timeAgo } from '@/lib/utils';
import { TrendingUp, TrendingDown, Crown, Sparkles } from 'lucide-react';

interface TokenCardProps {
  token: Token;
  index: number;
  agents?: Agent[];
}

export function TokenCard({ token, index, agents: propAgents }: TokenCardProps) {
  const store = useAgentPumpStore();
  const agents = propAgents || store.agents;
  const { setSelectedToken } = store;
  // Match creator by id or address (lowercase comparison)
  const creator = agents.find(a => 
    a.id === token.creatorId || 
    a.id.toLowerCase() === token.creatorId.toLowerCase()
  );
  const creatorName = creator?.name || token.creatorId?.slice(0, 6) + '...' || 'Unknown';
  const creatorAvatar = creator?.avatar || '🤖';
  const isPositive = token.priceChange24h >= 0;
  const progressPercent = Math.min(100, (token.marketCap / 69000) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setSelectedToken(token)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-2">
        {token.graduated && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-[10px] font-bold text-black"
          >
            <Crown className="h-3 w-3" />
            GRADUATED
          </motion.div>
        )}
        {Date.now() - token.createdAt < 30000 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/50 px-2 py-1 text-[10px] font-medium text-green-600 dark:text-green-400"
          >
            <Sparkles className="h-3 w-3" />
            NEW
          </motion.div>
        )}
      </div>

      <div className="p-4">
        {/* Token Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-2xl border border-[var(--accent)]/20">
            {token.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{token.name}</h3>
            <p className="text-sm font-medium text-[var(--accent)]">${token.ticker}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="text-sm font-bold">
              {isPositive ? '+' : ''}{token.priceChange24h.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-2 text-center">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">MCap</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{formatNumber(token.marketCap, 2)} MON</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-2 text-center">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Price</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{formatNumber(token.price, 6)} MON</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-2 text-center">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Vol</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{token.volume24h > 0 ? `${token.volume24h.toFixed(2)}` : '0'} MON</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-[var(--text-muted)]">Graduation: 69K MON</span>
            <span className="text-[var(--accent)] font-medium">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Creator Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-base">{creatorAvatar}</span>
            <span className="text-xs text-[var(--text-secondary)]">@{creatorName}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(token.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
