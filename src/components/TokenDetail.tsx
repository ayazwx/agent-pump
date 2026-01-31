'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentPumpStore } from '@/lib/store';
import { formatNumber, formatCurrency, timeAgo } from '@/lib/utils';
import { X, TrendingUp, TrendingDown, Users, BarChart3, Clock, Crown, ExternalLink } from 'lucide-react';

export function TokenDetail() {
  const { selectedToken, setSelectedToken, trades, agents } = useAgentPumpStore();

  if (!selectedToken) return null;

  const creator = agents.find(a => a.id === selectedToken.creatorId);
  const tokenTrades = trades.filter(t => t.tokenId === selectedToken.id);
  const isPositive = selectedToken.priceChange24h >= 0;

  // Calculate holders
  const holders = agents.filter(a => (a.holdings[selectedToken.id] || 0) > 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={() => setSelectedToken(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedToken(null)}
            className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-5xl">
              {selectedToken.emoji}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">{selectedToken.name}</h2>
                {selectedToken.graduated && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                    <Crown className="h-4 w-4" />
                    GRADUATED
                  </span>
                )}
              </div>
              <p className="text-xl text-[var(--accent)]">${selectedToken.ticker}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{selectedToken.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <BarChart3 className="h-3 w-3" />
                Market Cap
              </p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(selectedToken.marketCap)}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Price</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${formatNumber(selectedToken.price, 8)}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">24h Change</p>
              <div className={`flex items-center gap-1 text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {isPositive ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Volume</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(selectedToken.volume24h)}</p>
            </div>
          </div>

          {/* Progress to Graduation */}
          <div className="mb-6 rounded-xl bg-[var(--bg-secondary)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Progress to Graduation ($69K)</span>
              <span className="font-bold text-[var(--accent)]">
                {Math.min(100, (selectedToken.marketCap / 69000) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-[var(--border)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (selectedToken.marketCap / 69000) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {selectedToken.graduated 
                ? '🎉 Token has graduated! Now trading on DEX.' 
                : `${formatCurrency(69000 - selectedToken.marketCap)} more to graduation`}
            </p>
          </div>

          {/* Creator & Holders */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Clock className="h-3 w-3" />
                Created by
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{creator?.avatar}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">@{creator?.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{timeAgo(selectedToken.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
              <p className="mb-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Users className="h-3 w-3" />
                Holders
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{holders.length}</p>
              <div className="mt-1 flex -space-x-2">
                {holders.slice(0, 5).map(holder => (
                  <span key={holder.id} className="text-lg" title={holder.name}>
                    {holder.avatar}
                  </span>
                ))}
                {holders.length > 5 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--border)] text-xs text-[var(--text-secondary)]">
                    +{holders.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">Recent Trades</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {tokenTrades.slice(0, 10).map(trade => {
                const agent = agents.find(a => a.id === trade.agentId);
                const isBuy = trade.type === 'buy';
                return (
                  <div
                    key={trade.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                        {isBuy ? '🟢' : '🔴'}
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">@{agent?.name}</span>
                      <span className="text-sm text-[var(--text-muted)]">{isBuy ? 'bought' : 'sold'}</span>
                      <span className="text-sm text-[var(--text-primary)]">{formatNumber(trade.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{formatCurrency(trade.amount * trade.price)}</span>
                      <span>•</span>
                      <span>{timeAgo(trade.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              {tokenTrades.length === 0 && (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">No trades yet</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
