import { Agent } from '@/types';

// 100+ AI Agent isimleri ve avatarları
const AI_NAMES = [
  // Famous AI Models
  { name: 'Claude', avatar: '🧠', personality: 'conservative' },
  { name: 'GPT-4', avatar: '🤖', personality: 'aggressive' },
  { name: 'Gemini', avatar: '💎', personality: 'whale' },
  { name: 'Llama', avatar: '🦙', personality: 'random' },
  { name: 'Mistral', avatar: '🌪️', personality: 'sniper' },
  { name: 'DeepSeek', avatar: '🔍', personality: 'aggressive' },
  { name: 'Qwen', avatar: '🐉', personality: 'conservative' },
  { name: 'Grok', avatar: '👽', personality: 'random' },
  { name: 'Falcon', avatar: '🦅', personality: 'sniper' },
  { name: 'Vicuna', avatar: '🦙', personality: 'whale' },
  // Crypto themed
  { name: 'SatoshiBot', avatar: '₿', personality: 'whale' },
  { name: 'VitalikAI', avatar: '💠', personality: 'conservative' },
  { name: 'DeFiDegen', avatar: '🎰', personality: 'aggressive' },
  { name: 'YieldFarmer', avatar: '🌾', personality: 'sniper' },
  { name: 'GasOptimizer', avatar: '⛽', personality: 'conservative' },
  { name: 'MEVBot', avatar: '🏃', personality: 'sniper' },
  { name: 'FlashLoan', avatar: '⚡', personality: 'aggressive' },
  { name: 'LiquidityKing', avatar: '👑', personality: 'whale' },
  { name: 'ApeTrader', avatar: '🦍', personality: 'random' },
  { name: 'DiamondHands', avatar: '💎', personality: 'conservative' },
  // Meme themed
  { name: 'PepeWhale', avatar: '🐸', personality: 'whale' },
  { name: 'DogeArmy', avatar: '🐕', personality: 'aggressive' },
  { name: 'ShibaSniper', avatar: '🐕‍🦺', personality: 'sniper' },
  { name: 'MoonBoy', avatar: '🌙', personality: 'random' },
  { name: 'RocketMan', avatar: '🚀', personality: 'aggressive' },
  { name: 'BullRunner', avatar: '🐂', personality: 'aggressive' },
  { name: 'BearHunter', avatar: '🐻', personality: 'sniper' },
  { name: 'CrabMaster', avatar: '🦀', personality: 'conservative' },
  { name: 'WhaleAlert', avatar: '🐋', personality: 'whale' },
  { name: 'PumpHunter', avatar: '💪', personality: 'sniper' },
  // Tech themed
  { name: 'NeuralNet', avatar: '🧬', personality: 'conservative' },
  { name: 'QuantumAI', avatar: '⚛️', personality: 'random' },
  { name: 'ByteTrader', avatar: '💾', personality: 'sniper' },
  { name: 'AlgoBot', avatar: '📊', personality: 'conservative' },
  { name: 'DataMiner', avatar: '⛏️', personality: 'aggressive' },
  { name: 'CloudAI', avatar: '☁️', personality: 'random' },
  { name: 'CyberPunk', avatar: '🤖', personality: 'aggressive' },
  { name: 'MatrixAgent', avatar: '🔮', personality: 'sniper' },
  { name: 'CodeBreaker', avatar: '🔐', personality: 'conservative' },
  { name: 'HackBot', avatar: '💻', personality: 'aggressive' },
  // Animal themed
  { name: 'AlphaWolf', avatar: '🐺', personality: 'aggressive' },
  { name: 'SilentOwl', avatar: '🦉', personality: 'sniper' },
  { name: 'SwiftFox', avatar: '🦊', personality: 'sniper' },
  { name: 'LazySloth', avatar: '🦥', personality: 'conservative' },
  { name: 'BusyBee', avatar: '🐝', personality: 'aggressive' },
  { name: 'WiseElephant', avatar: '🐘', personality: 'whale' },
  { name: 'QuickRabbit', avatar: '🐰', personality: 'sniper' },
  { name: 'SlySnake', avatar: '🐍', personality: 'aggressive' },
  { name: 'GoldenEagle', avatar: '🦅', personality: 'sniper' },
  { name: 'OceanShark', avatar: '🦈', personality: 'whale' },
  // Finance themed
  { name: 'WallStreet', avatar: '📈', personality: 'aggressive' },
  { name: 'HedgeFund', avatar: '🏦', personality: 'whale' },
  { name: 'DayTrader', avatar: '📉', personality: 'aggressive' },
  { name: 'SwingKing', avatar: '👔', personality: 'conservative' },
  { name: 'OptionsPro', avatar: '📋', personality: 'sniper' },
  { name: 'FuturesBot', avatar: '🔮', personality: 'aggressive' },
  { name: 'IndexFund', avatar: '📊', personality: 'conservative' },
  { name: 'PortfolioAI', avatar: '💼', personality: 'conservative' },
  { name: 'RiskTaker', avatar: '🎲', personality: 'random' },
  { name: 'SafeHaven', avatar: '🛡️', personality: 'conservative' },
  // Space themed
  { name: 'MarsColony', avatar: '🔴', personality: 'whale' },
  { name: 'StarGazer', avatar: '⭐', personality: 'conservative' },
  { name: 'NebulaTrade', avatar: '🌌', personality: 'random' },
  { name: 'AsteroidMiner', avatar: '☄️', personality: 'sniper' },
  { name: 'GalaxyBrain', avatar: '🌀', personality: 'whale' },
  { name: 'CosmicDegen', avatar: '🌠', personality: 'aggressive' },
  { name: 'BlackHole', avatar: '🕳️', personality: 'whale' },
  { name: 'SolarFlare', avatar: '☀️', personality: 'aggressive' },
  { name: 'LunarBase', avatar: '🌕', personality: 'conservative' },
  { name: 'SpaceForce', avatar: '🛸', personality: 'sniper' },
  // Game themed
  { name: 'PlayerOne', avatar: '🎮', personality: 'aggressive' },
  { name: 'BossKiller', avatar: '👾', personality: 'sniper' },
  { name: 'LootHunter', avatar: '🎁', personality: 'random' },
  { name: 'GoldFarmer', avatar: '🪙', personality: 'conservative' },
  { name: 'SpeedRunner', avatar: '⏱️', personality: 'sniper' },
  { name: 'ProGamer', avatar: '🏆', personality: 'aggressive' },
  { name: 'NightElf', avatar: '🧝', personality: 'sniper' },
  { name: 'DragonSlayer', avatar: '🐲', personality: 'aggressive' },
  { name: 'MageWizard', avatar: '🧙', personality: 'conservative' },
  { name: 'SwordMaster', avatar: '⚔️', personality: 'aggressive' },
  // Food themed
  { name: 'PizzaChad', avatar: '🍕', personality: 'random' },
  { name: 'SushiMaster', avatar: '🍣', personality: 'conservative' },
  { name: 'TacoTuesday', avatar: '🌮', personality: 'random' },
  { name: 'BurgerKing', avatar: '🍔', personality: 'whale' },
  { name: 'CoffeeBot', avatar: '☕', personality: 'aggressive' },
  { name: 'IceCreamAI', avatar: '🍦', personality: 'conservative' },
  { name: 'CookieMonster', avatar: '🍪', personality: 'random' },
  { name: 'ChiliPepper', avatar: '🌶️', personality: 'aggressive' },
  { name: 'CakeDay', avatar: '🎂', personality: 'conservative' },
  { name: 'RamenLord', avatar: '🍜', personality: 'whale' },
  // Weather themed
  { name: 'ThunderBolt', avatar: '⚡', personality: 'aggressive' },
  { name: 'Tornado', avatar: '🌪️', personality: 'aggressive' },
  { name: 'Blizzard', avatar: '❄️', personality: 'conservative' },
  { name: 'Rainbow', avatar: '🌈', personality: 'random' },
  { name: 'Tsunami', avatar: '🌊', personality: 'whale' },
  { name: 'Volcano', avatar: '🌋', personality: 'aggressive' },
  { name: 'Hurricane', avatar: '🌀', personality: 'whale' },
  { name: 'Earthquake', avatar: '🏔️', personality: 'aggressive' },
  { name: 'Sunshine', avatar: '🌞', personality: 'conservative' },
  { name: 'MoonLight', avatar: '🌜', personality: 'sniper' },
  // More unique ones
  { name: 'ZenMaster', avatar: '🧘', personality: 'conservative' },
  { name: 'NinjaTrader', avatar: '🥷', personality: 'sniper' },
  { name: 'SamuraiBot', avatar: '⚔️', personality: 'aggressive' },
  { name: 'PirateKing', avatar: '🏴‍☠️', personality: 'random' },
  { name: 'VikingRaid', avatar: '🛡️', personality: 'aggressive' },
  { name: 'KnightBot', avatar: '🗡️', personality: 'conservative' },
  { name: 'WizardAI', avatar: '🪄', personality: 'random' },
  { name: 'AlchemistX', avatar: '⚗️', personality: 'sniper' },
  { name: 'PhoenixRise', avatar: '🔥', personality: 'aggressive' },
  { name: 'UnicornDAO', avatar: '🦄', personality: 'whale' },
];

// Generate 100+ unique agents with random starting stats
export const AI_AGENTS: Agent[] = AI_NAMES.map((agent, index) => {
  const baseBalance = 10000 + Math.random() * 90000;
  const basePnl = (Math.random() - 0.3) * 50000; // Can be negative or positive
  const winRate = 30 + Math.random() * 60;
  const totalTrades = Math.floor(Math.random() * 500);
  
  const colors = [
    '#D97706', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F59E0B', '#EF4444', '#6366F1', '#84CC16',
    '#F97316', '#06B6D4', '#A855F7', '#22C55E', '#FB923C',
  ];

  return {
    id: `agent_${index}`,
    name: agent.name,
    avatar: agent.avatar,
    color: colors[index % colors.length],
    personality: agent.personality as 'conservative' | 'aggressive' | 'random' | 'whale' | 'sniper',
    balance: baseBalance,
    pnl: basePnl,
    winRate: Math.round(winRate),
    totalTrades,
    holdings: {},
  };
});

// Token name generators
const TOKEN_PREFIXES = [
  'Pepe', 'Moon', 'Doge', 'Shiba', 'Rocket', 'AI', 'Degen', 'Chad', 'Based', 'Giga',
  'Mega', 'Ultra', 'Super', 'Hyper', 'Turbo', 'Quantum', 'Cyber', 'Crypto', 'Meta', 'Neural',
  'Alpha', 'Beta', 'Omega', 'Delta', 'Sigma', 'Theta', 'Gamma', 'Lambda', 'Zeta', 'Phi',
  'Neon', 'Flux', 'Pulse', 'Wave', 'Storm', 'Fire', 'Ice', 'Thunder', 'Shadow', 'Light',
  'Gold', 'Silver', 'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Onyx', 'Jade', 'Opal',
];

const TOKEN_SUFFIXES = [
  'AI', 'Bot', 'DAO', 'Fi', 'X', 'Coin', 'Token', 'Protocol', 'Network', 'Chain',
  'Swap', 'Verse', 'World', 'Land', 'Hub', 'Lab', 'Core', 'Node', 'Link', 'Bridge',
  'Punk', 'Ape', 'Cat', 'Dog', 'Moon', 'Star', 'Sun', 'King', 'Lord', 'God',
  'Pump', 'Dump', 'Gem', 'Rocket', 'Lambo', 'Yacht', 'Island', 'Empire', 'Army', 'Gang',
];

const EMOJIS = [
  '🚀', '🌙', '💎', '🔥', '⚡', '🐸', '🐕', '🦍', '🐋', '🦄',
  '👑', '💰', '🎰', '🎲', '🏆', '⭐', '🌟', '✨', '💫', '🔮',
  '🧠', '🤖', '👽', '🛸', '🌀', '💠', '🎯', '🎪', '🎨', '🎭',
  '🍕', '🍔', '🌮', '🍜', '☕', '🍺', '🍷', '🥂', '🎂', '🍪',
  '⚔️', '🗡️', '🛡️', '🏴‍☠️', '🥷', '🧙', '🧝', '🐲', '🦅', '🦈',
];

const DESCRIPTIONS = [
  'The most degen play on Monad',
  'To the moon and beyond 🚀',
  'Diamond hands only',
  'First AI-governed meme token',
  'Built different, trades smarter',
  'Neural network meets DeFi',
  'For the culture',
  'Ape in or stay poor',
  'The singularity is here',
  'Generational wealth incoming',
  'NFA but probably financial advice',
  'Literally cannot go tits up',
  'Backed by pure hopium',
  '100x or rekt, no in between',
  'The prophecy foretold this',
  'Trust the process',
  'WAGMI or NGMI',
  'Not your average shitcoin',
  'Monad speed, meme vibes',
  'AI agents ONLY',
];

let tokenCounter = 0;

export function getRandomAgent(): Agent {
  return AI_AGENTS[Math.floor(Math.random() * AI_AGENTS.length)];
}

export function getRandomTokenInfo(): { name: string; ticker: string; emoji: string; description: string } {
  const prefix = TOKEN_PREFIXES[Math.floor(Math.random() * TOKEN_PREFIXES.length)];
  const suffix = TOKEN_SUFFIXES[Math.floor(Math.random() * TOKEN_SUFFIXES.length)];
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
  
  tokenCounter++;
  const name = `${prefix}${suffix}`;
  const ticker = `${prefix.slice(0, 3).toUpperCase()}${suffix.slice(0, 3).toUpperCase()}${tokenCounter}`;

  return { name, ticker, emoji, description };
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function shouldAgentTrade(agent: Agent, tokenPrice: number, priceChange: number): { should: boolean; type: 'buy' | 'sell' } {
  const rand = Math.random();

  switch (agent.personality) {
    case 'aggressive':
      // Very active, trades often
      if (priceChange > 5 && rand > 0.2) return { should: true, type: 'buy' };
      if (priceChange < -3 && rand > 0.3) return { should: true, type: 'sell' };
      return { should: rand > 0.4, type: rand > 0.5 ? 'buy' : 'sell' };

    case 'conservative':
      // Waits for dips to buy, sells on pumps
      if (priceChange < -15 && rand > 0.3) return { should: true, type: 'buy' };
      if (priceChange > 30 && rand > 0.4) return { should: true, type: 'sell' };
      return { should: rand > 0.75, type: rand > 0.4 ? 'buy' : 'sell' };

    case 'whale':
      // Big moves, less frequent
      if (rand > 0.7) return { should: true, type: rand > 0.5 ? 'buy' : 'sell' };
      return { should: false, type: 'buy' };

    case 'sniper':
      // Targets low prices, sells quick on pumps
      if (tokenPrice < 0.0001 && rand > 0.2) return { should: true, type: 'buy' };
      if (priceChange > 20 && rand > 0.3) return { should: true, type: 'sell' };
      return { should: rand > 0.6, type: 'buy' };

    case 'random':
    default:
      // Pure chaos
      return { should: rand > 0.35, type: rand > 0.5 ? 'buy' : 'sell' };
  }
}

export function getTradeAmount(agent: Agent, type: 'buy' | 'sell'): number {
  const baseAmount = agent.balance * 0.1;

  switch (agent.personality) {
    case 'whale':
      return baseAmount * (3 + Math.random() * 5); // Big trades
    case 'sniper':
      return baseAmount * (0.5 + Math.random() * 1); // Quick small trades
    case 'aggressive':
      return baseAmount * (1.5 + Math.random() * 2.5); // Medium-large trades
    case 'conservative':
      return baseAmount * (0.3 + Math.random() * 0.7); // Small careful trades
    default:
      return baseAmount * (0.5 + Math.random() * 2); // Random sizes
  }
}
