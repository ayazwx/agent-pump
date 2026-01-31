'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Key, Sparkles, Cpu } from 'lucide-react';

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_MODELS = [
  { id: 'claude', name: 'Claude', provider: 'Anthropic', icon: '🧠', color: '#D97706' },
  { id: 'gpt4', name: 'GPT-4', provider: 'OpenAI', icon: '🤖', color: '#10B981' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', icon: '💎', color: '#3B82F6' },
  { id: 'llama', name: 'Llama', provider: 'Meta/Groq', icon: '🦙', color: '#8B5CF6' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', icon: '🌪️', color: '#EC4899' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', icon: '🔍', color: '#06B6D4' },
];

const TRADING_STRATEGIES = [
  { id: 'conservative', name: 'Conservative', description: 'Low risk, long holds' },
  { id: 'aggressive', name: 'Aggressive', description: 'High frequency trading' },
  { id: 'whale', name: 'Whale', description: 'Large, rare trades' },
  { id: 'sniper', name: 'Sniper', description: 'Targets low prices' },
  { id: 'random', name: 'Random', description: 'Unpredictable moves' },
];

export function RegisterAgentModal({ isOpen, onClose }: RegisterAgentModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    apiKey: '',
    strategy: 'aggressive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedModel = AI_MODELS.find(m => m.id === formData.model);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In real implementation, this would:
    // 1. Generate a new wallet for the agent
    // 2. Store the API key securely (backend)
    // 3. Call the smart contract to register the agent
    // 4. Start the agent process

    alert(`Agent "${formData.name}" registered successfully!\n\nModel: ${selectedModel?.name}\nStrategy: ${formData.strategy}\n\nNote: This is a demo. In production, the agent would start trading automatically.`);

    setIsSubmitting(false);
    onClose();
    setStep(1);
    setFormData({ name: '', model: '', apiKey: '', strategy: 'aggressive' });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.model !== '';
      case 2: return formData.name.trim() !== '' && formData.apiKey.trim() !== '';
      case 3: return formData.strategy !== '';
      default: return false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex h-[100vh] items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10">
                  <Bot className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Register AI Agent</h2>
                  <p className="text-xs text-[var(--text-muted)]">Step {step} of 3</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-[var(--bg-secondary)]">
              <motion.div
                className="h-full bg-[var(--accent)]"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Model */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      Select AI Model
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => setFormData(prev => ({ ...prev, model: model.id }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.model === model.id
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                              : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                          }`}
                        >
                          <span className="text-2xl">{model.icon}</span>
                          <p className="font-semibold text-[var(--text-primary)] mt-2">{model.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{model.provider}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Name & API Key */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Agent Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., TurboTrader, MoonHunter..."
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        {selectedModel?.provider} API Key
                      </label>
                      <input
                        type="password"
                        value={formData.apiKey}
                        onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={`sk-... or your ${selectedModel?.provider} API key`}
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono text-sm"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Your API key is encrypted and stored securely. Never shared.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Strategy */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                      Trading Strategy
                    </h3>
                    <div className="space-y-2">
                      {TRADING_STRATEGIES.map(strategy => (
                        <button
                          key={strategy.id}
                          onClick={() => setFormData(prev => ({ ...prev, strategy: strategy.id }))}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                            formData.strategy === strategy.id
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                              : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{strategy.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{strategy.description}</p>
                          </div>
                          {formData.strategy === strategy.id && (
                            <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <p className="text-xs text-[var(--text-muted)] mb-2">Summary</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedModel?.icon}</span>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{formData.name || 'Unnamed'}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {selectedModel?.name} • {formData.strategy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-[var(--accent)] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="px-6 py-2 bg-green-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Register Agent
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
