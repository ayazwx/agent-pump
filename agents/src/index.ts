import 'dotenv/config';
import { TradingAgent } from './agent.js';
import { ClaudeProvider, GeminiProvider, RandomProvider, Personality } from './ai-providers.js';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface AgentConfig {
  name: string;
  personality: Personality;
  keyEnv: string;
  aiType: 'claude' | 'gemini' | 'random';
}

const AGENT_CONFIGS: AgentConfig[] = [
  // 3 Agent: Claude (AI), Gemini (Random - API quota issue), Llama (Random)
  { name: 'Claude', personality: 'conservative', keyEnv: 'AGENT_CLAUDE_KEY', aiType: 'claude' },
  { name: 'Gemini', personality: 'aggressive', keyEnv: 'AGENT_GEMINI_KEY', aiType: 'random' },
  { name: 'Llama', personality: 'whale', keyEnv: 'AGENT_LLAMA_KEY', aiType: 'random' },
];

async function main() {
  console.log('🚀 AgentPump - AI Trading Agents\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }

  console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 RPC: ${RPC_URL}\n`);

  const agents: TradingAgent[] = [];

  for (const config of AGENT_CONFIGS) {
    const privateKey = process.env[config.keyEnv];
    
    if (!privateKey) {
      console.log(`⚠️ Skipping ${config.name}: No private key`);
      continue;
    }

    // Create AI provider
    let aiProvider;
    switch (config.aiType) {
      case 'claude':
        if (process.env.ANTHROPIC_API_KEY) {
          aiProvider = new ClaudeProvider(process.env.ANTHROPIC_API_KEY);
        } else {
          console.log(`⚠️ ${config.name}: No Anthropic API key, using random`);
          aiProvider = new RandomProvider();
        }
        break;
      case 'gemini':
        if (process.env.GOOGLE_AI_API_KEY) {
          aiProvider = new GeminiProvider(process.env.GOOGLE_AI_API_KEY);
        } else {
          console.log(`⚠️ ${config.name}: No Google AI API key, using random`);
          aiProvider = new RandomProvider();
        }
        break;
      default:
        aiProvider = new RandomProvider();
    }

    const agent = new TradingAgent(
      config.name,
      config.personality,
      privateKey,
      CONTRACT_ADDRESS,
      RPC_URL,
      aiProvider
    );

    agents.push(agent);
  }

  if (agents.length === 0) {
    console.error('❌ No agents configured! Add private keys to .env');
    process.exit(1);
  }

  console.log(`\n✅ Starting ${agents.length} agent(s)...\n`);

  // Start agents with staggered intervals to avoid RPC rate limits (25/sec free tier)
  for (let i = 0; i < agents.length; i++) {
    const interval = 30000; // 30 seconds between actions per agent
    // Stagger start times so agents don't all call RPC at once
    setTimeout(() => {
      agents[i].start(interval);
    }, i * 10000); // 10 second delay between each agent start
  }

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down agents...');
    agents.forEach(a => a.stop());
    process.exit(0);
  });
}

main().catch(console.error);
