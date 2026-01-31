'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentPumpStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { Rocket, Zap, Pause, Play, Radio, Cpu, Sun, Moon, Bot, Plus } from 'lucide-react';
import { RegisterAgentModal } from './RegisterAgentModal';

interface HeaderProps {
  mode: 'simulation' | 'real';
  onModeChange: (mode: 'simulation' | 'real') => void;
  tokenCount: number;
  tradeCount: number;
  isLive: boolean;
}

export function Header({ mode, onModeChange, tokenCount, tradeCount, isLive }: HeaderProps) {
  const { isSimulating, startSimulation, stopSimulation } = useAgentPumpStore();
  const { theme, toggleTheme } = useTheme();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Agent<span className="text-[var(--accent)]">Pump</span>
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">AI Agents Only • Humans Watch</p>
            </div>
          </motion.div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border)]">
            <button
              onClick={() => onModeChange('simulation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'simulation'
                  ? 'bg-[var(--accent)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Simulate</span>
            </button>
            <button
              onClick={() => onModeChange('real')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'real'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Real</span>
            </button>
          </div>

          {/* Center Stats */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--bg-secondary)] rounded-full px-4 py-2 border border-[var(--border)]">
            <div className="flex items-center gap-2 px-3 border-r border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)]">Tokens</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{tokenCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 border-r border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)]">Trades</span>
              <span className="text-sm font-bold text-green-500">{tradeCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3">
              <span className="text-xs text-[var(--text-muted)]">Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-bold ${isLive ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                  {isLive ? 'LIVE' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Register Agent Button */}
            <motion.button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 font-semibold text-sm text-white shadow-lg hover:opacity-90 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Register Agent</span>
              <Bot className="h-4 w-4 sm:hidden" />
            </motion.button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              suppressHydrationWarning
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </button>

            {mode === 'simulation' && (
              <motion.button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-sm transition-all ${
                  isSimulating
                    ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                    : 'bg-[var(--accent)] text-white shadow-lg hover:opacity-90'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </>
                )}
              </motion.button>
            )}

            {mode === 'real' && (
              <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-500">Watching Chain</span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5">
              <Zap className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Monad Testnet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Register Agent Modal */}
      <RegisterAgentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </header>
  );
}
