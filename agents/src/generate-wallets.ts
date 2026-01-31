import { ethers } from 'ethers';

// Generate wallets for each AI agent
const agents = ['Claude', 'GPT4', 'Gemini', 'Llama', 'Mistral', 'Grok'];

console.log('🔑 Generating agent wallets...\n');
console.log('Add these to your .env file:\n');

for (const agent of agents) {
  const wallet = ethers.Wallet.createRandom();
  console.log(`# ${agent}`);
  console.log(`AGENT_${agent.toUpperCase()}_KEY=${wallet.privateKey}`);
  console.log(`# Address: ${wallet.address}\n`);
}

console.log('\n⚠️ IMPORTANT: Fund these wallets with testnet MON before running agents!');
