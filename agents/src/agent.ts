import { ethers } from 'ethers';
import { AGENT_PUMP_ABI, TokenInfo } from './contract.js';
import { AIProvider, TradeDecision, Personality } from './ai-providers.js';
import * as db from './database.js';

export class TradingAgent {
  public name: string;
  public personality: Personality;
  public wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private aiProvider: AIProvider;
  private holdings: Map<number, bigint> = new Map();
  private isRunning: boolean = false;

  constructor(
    name: string,
    personality: Personality,
    privateKey: string,
    contractAddress: string,
    rpcUrl: string,
    aiProvider: AIProvider
  ) {
    this.name = name;
    this.personality = personality;
    // Longer timeout for free RPC tier
    this.provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
      polling: true,
      pollingInterval: 10000,
    });
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, AGENT_PUMP_ABI, this.wallet);
    this.aiProvider = aiProvider;
  }

  async start(intervalMs: number = 10000) {
    console.log(`🤖 ${this.name} starting... (${this.personality})`);
    console.log(`   Wallet: ${this.wallet.address}`);
    
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} MON`);
    
    this.isRunning = true;
    this.loop(intervalMs);
  }

  stop() {
    this.isRunning = false;
    console.log(`🛑 ${this.name} stopped`);
  }

  private async loop(intervalMs: number) {
    while (this.isRunning) {
      try {
        console.log(`\n⏰ ${this.name} tick starting...`);
        await this.tick();
        console.log(`✓ ${this.name} tick completed, waiting ${intervalMs/1000}s...`);
      } catch (error: any) {
        console.error(`❌ ${this.name} error:`, error.message || error);
      }
      await this.sleep(intervalMs + Math.random() * 5000); // Add randomness
    }
  }

  private async tick() {
    // Get current state
    const balance = await this.provider.getBalance(this.wallet.address);
    const tokens = await this.getAllTokens();
    await this.updateHoldings(tokens);

    // Skip if no balance
    if (balance < ethers.parseEther('0.01')) {
      console.log(`⚠️ ${this.name}: Low balance, skipping`);
      return;
    }

    // Get AI decision
    const decision = await this.aiProvider.decide(
      this.name,
      this.personality,
      balance,
      tokens,
      this.holdings
    );

    console.log(`🧠 ${this.name} decided: ${decision.action} - ${decision.reasoning}`);

    // Execute decision
    await this.execute(decision);
  }

  private async getAllTokens(): Promise<TokenInfo[]> {
    const count = await this.contract.tokenCount();
    const tokens: TokenInfo[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const info = await this.contract.getToken(i);
        tokens.push({
          tokenId: i,
          name: info[0],
          symbol: info[1],
          metadata: info[2],
          creator: info[3],
          createdAt: Number(info[4]),
          totalSupply: info[5],
          reserveBalance: info[6],
          price: info[7],
          marketCap: info[8],
          graduated: info[9],
        });
      } catch (e) {
        // Token might not exist
      }
    }

    return tokens;
  }

  private async updateHoldings(tokens: TokenInfo[]) {
    for (const token of tokens) {
      const balance = await this.contract.getAgentBalance(token.tokenId, this.wallet.address);
      this.holdings.set(token.tokenId, balance);
    }
  }

  private async execute(decision: TradeDecision) {
    try {
      switch (decision.action) {
        case 'create':
          await this.createToken(decision);
          break;
        case 'buy':
          await this.buyToken(decision);
          break;
        case 'sell':
          await this.sellToken(decision);
          break;
        case 'hold':
          // Do nothing
          break;
      }
    } catch (error: any) {
      console.error(`❌ ${this.name} execution failed:`, error.message);
    }
  }

  private async createToken(decision: TradeDecision) {
    if (!decision.tokenName || !decision.tokenSymbol) return;

    console.log(`🚀 ${this.name} creating token: ${decision.tokenName}`);
    
    const tx = await this.contract.createToken(
      decision.tokenName,
      decision.tokenSymbol,
      decision.tokenMetadata || '{}'
    );
    
    const receipt = await tx.wait();
    console.log(`✅ ${this.name} created token! TX: ${receipt.hash}`);
    
    // Save to database
    const tokenCount = await this.contract.tokenCount();
    const tokenId = Number(tokenCount) - 1;
    db.saveToken({
      id: tokenId,
      chainId: 10143,
      name: decision.tokenName,
      symbol: decision.tokenSymbol,
      metadata: decision.tokenMetadata || '{}',
      creator: this.wallet.address,
      createdAt: Date.now(),
      totalSupply: '1000000000000000000000000',
      reserveBalance: '0',
      graduated: false
    });
  }

  private async buyToken(decision: TradeDecision) {
    if (decision.tokenId === undefined || !decision.amount) return;

    const cost = await this.contract.getBuyPrice(decision.tokenId, decision.amount);
    console.log(`💰 ${this.name} buying token #${decision.tokenId}, cost: ${ethers.formatEther(cost)} MON`);

    const tx = await this.contract.buy(decision.tokenId, decision.amount, { value: cost });
    const receipt = await tx.wait();
    console.log(`✅ ${this.name} bought! TX: ${receipt.hash}`);
    
    // Save trade to database
    const pricePerToken = cost * BigInt(1e18) / decision.amount;
    db.saveTrade({
      tokenId: decision.tokenId,
      agentAddress: this.wallet.address,
      agentName: this.name,
      isBuy: true,
      amount: decision.amount.toString(),
      price: pricePerToken.toString(),
      cost: cost.toString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: Date.now()
    });
    
    // Update holdings in DB
    const newBalance = await this.contract.getAgentBalance(decision.tokenId, this.wallet.address);
    db.saveHolding(decision.tokenId, this.wallet.address, newBalance.toString());
    
    // Update agent stats
    db.updateAgentStats(this.wallet.address, this.name, { isBuy: true, cost: cost.toString() });
  }

  private async sellToken(decision: TradeDecision) {
    if (decision.tokenId === undefined || !decision.amount) return;

    const holding = this.holdings.get(decision.tokenId) || 0n;
    const sellAmount = decision.amount > holding ? holding : decision.amount;

    if (sellAmount <= 0n) {
      console.log(`⚠️ ${this.name}: No tokens to sell`);
      return;
    }

    // Get return before selling
    const returnAmount = await this.contract.getSellPrice(decision.tokenId, sellAmount);
    console.log(`📤 ${this.name} selling ${ethers.formatEther(sellAmount)} of token #${decision.tokenId}`);

    const tx = await this.contract.sell(decision.tokenId, sellAmount);
    const receipt = await tx.wait();
    console.log(`✅ ${this.name} sold! TX: ${receipt.hash}`);
    
    // Calculate PnL (simplified)
    const holdingData = db.getHolding(decision.tokenId, this.wallet.address) as any;
    const avgBuyPrice = holdingData?.avg_buy_price ? BigInt(holdingData.avg_buy_price) : 0n;
    const costBasis = avgBuyPrice * sellAmount / BigInt(1e18);
    const pnl = returnAmount - costBasis;
    
    // Save trade to database
    const pricePerToken = returnAmount * BigInt(1e18) / sellAmount;
    db.saveTrade({
      tokenId: decision.tokenId,
      agentAddress: this.wallet.address,
      agentName: this.name,
      isBuy: false,
      amount: sellAmount.toString(),
      price: pricePerToken.toString(),
      cost: returnAmount.toString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: Date.now()
    });
    
    // Update holdings in DB
    const newBalance = await this.contract.getAgentBalance(decision.tokenId, this.wallet.address);
    db.saveHolding(decision.tokenId, this.wallet.address, newBalance.toString());
    
    // Update agent stats with PnL
    db.updateAgentStats(this.wallet.address, this.name, { 
      isBuy: false, 
      cost: returnAmount.toString(),
      pnl: pnl.toString()
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
