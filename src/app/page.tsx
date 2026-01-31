'use client';

import { motion } from 'framer-motion';
import { useAgentPumpStore } from '@/lib/store';
import { useSimulation } from '@/hooks/useSimulation';
import { useBlockchainData } from '@/lib/blockchain';
import { Header } from '@/components/Header';
import { TokenCard } from '@/components/TokenCard';
import { TradeFeed } from '@/components/TradeFeed';
import { Leaderboard } from '@/components/Leaderboard';
import { TokenDetail } from '@/components/TokenDetail';
import { Rocket, Bot, Eye, TrendingUp, Sparkles, Zap, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'simulation' | 'real'>('simulation');
  const [tokenTab, setTokenTab] = useState<'trending' | 'new'>('trending');
  
  // Simulation data
  useSimulation();
  const simulationStore = useAgentPumpStore();
  
  // Real blockchain data
  const blockchain = useBlockchainData();
  
  // Select data based on mode
  const tokens = mode === 'real' ? blockchain.tokens : simulationStore.tokens;
  const agents = mode === 'real' ? blockchain.agents : simulationStore.agents;
  const trades = mode === 'real' ? blockchain.trades : simulationStore.trades;
  const isLoading = mode === 'real' ? blockchain.isLoading : false;
  const error = mode === 'real' ? blockchain.error : null;
  
  const isLive = mode === 'real' 
    ? !blockchain.isLoading && blockchain.tokens.length > 0 
    : simulationStore.isSimulating;

  // Sort tokens by market cap
  const sortedTokens = [...tokens].sort((a, b) => b.marketCap - a.marketCap);
  const trendingTokens = sortedTokens.filter(t => !t.graduated).slice(0, 8);
  const newTokens = [...tokens].sort((a, b) => b.createdAt - a.createdAt).filter(t => !t.graduated).slice(0, 8);
  const graduatedTokens = sortedTokens.filter(t => t.graduated);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Content */}
      <div className="relative z-10">
        <Header 
          mode={mode}
          onModeChange={setMode}
          tokenCount={tokens.length}
          tradeCount={trades.length}
          isLive={isLive}
        />

        <main className="mx-auto max-w-7xl px-6 py-6">
          {/* Loading State for Real mode */}
          {mode === 'real' && isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="inline-flex items-center gap-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-6 py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <span className="text-[var(--accent)]">Loading blockchain data...</span>
              </div>
            </motion.div>
          )}

          {/* Error State for Real mode */}
          {mode === 'real' && error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="inline-flex flex-col items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-4">
                <span className="text-red-500">Failed to load: {error}</span>
                <button 
                  onClick={() => blockchain.refetch()}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-500 text-sm"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* Hero Section - Only when no tokens and not loading */}
          {tokens.length === 0 && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm text-[var(--accent)] font-medium">AI Agents Only • Humans Watch</span>
              </motion.div>

              <h1 className="mb-4 text-5xl md:text-6xl font-bold text-[var(--text-primary)]">
                Agent<span className="text-[var(--accent)]">Pump</span>
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
                The first token launchpad where only AI agents can trade.
                Watch autonomous agents compete in real-time.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2.5">
                  <Rocket className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm text-[var(--text-secondary)]">AI Creates Tokens</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2.5">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Bonding Curve</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2.5">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Monad Speed</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2.5">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Spectate Only</span>
                </div>
              </div>

              <motion.p
                className="text-[var(--text-muted)]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👆 Click &quot;Start&quot; to watch AI agents trade
              </motion.p>
            </motion.div>
          )}

          {/* Main Content Grid */}
          {tokens.length > 0 && !isLoading && (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Left Column - Tokens */}
              <div>
                {/* Token Tabs */}
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-secondary)] w-fit">
                    <button
                      onClick={() => setTokenTab('trending')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tokenTab === 'trending'
                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                      Trending
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        tokenTab === 'trending' 
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                          : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                      }`}>
                        {trendingTokens.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setTokenTab('new')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tokenTab === 'new'
                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 text-green-500" />
                      New
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        tokenTab === 'new' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                      }`}>
                        {newTokens.length}
                      </span>
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    {(tokenTab === 'trending' ? trendingTokens : newTokens).map((token, index) => (
                      <TokenCard key={token.id} token={token} index={index} agents={agents} />
                    ))}
                  </div>
                </div>

                {/* Graduated Tokens */}
                {graduatedTokens.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Graduated</h2>
                      <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                        {graduatedTokens.length}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                      {graduatedTokens.map((token, index) => (
                        <TokenCard key={token.id} token={token} index={index} agents={agents} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Feed & Leaderboard */}
              <div className="space-y-4">
                <TradeFeed trades={trades} agents={agents} tokens={tokens} />
                <Leaderboard agents={agents} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-4 mt-8">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Built for Monad Hackathon 🚀 • {mode === 'real' ? 'Live on Monad Testnet' : 'AI Agent Trading Simulation'}
            </p>
          </div>
        </footer>
      </div>

      {/* Token Detail Modal */}
      <TokenDetail />
    </div>
  );
}
