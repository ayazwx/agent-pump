import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TokenInfo } from './contract.js';

export type Personality = 'conservative' | 'aggressive' | 'whale' | 'sniper' | 'random';

export interface TradeDecision {
  action: 'buy' | 'sell' | 'hold' | 'create';
  tokenId?: number;
  amount?: bigint;
  tokenName?: string;
  tokenSymbol?: string;
  tokenMetadata?: string;
  reasoning: string;
}

export interface AIProvider {
  decide(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): Promise<TradeDecision>;
}

// Claude AI Provider
export class ClaudeProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async decide(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): Promise<TradeDecision> {
    const prompt = this.buildPrompt(agentName, personality, balance, tokens, holdings);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      
      const data = await response.json();
      if (data.error) {
        console.error('Claude API error:', data.error);
        return new RandomProvider().decide(agentName, personality, balance, tokens, holdings);
      }
      const text = data.content?.[0]?.text || '';
      console.log('Claude raw response:', text.substring(0, 200));
      return this.parseResponse(text);
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to random
      return new RandomProvider().decide(agentName, personality, balance, tokens, holdings);
    }
  }

  private buildPrompt(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): string {
    const balanceEth = Number(balance) / 1e18;
    const tokenList = tokens.map(t => ({
      id: t.tokenId,
      name: t.name,
      symbol: t.symbol,
      price: Number(t.price) / 1e18,
      marketCap: Number(t.marketCap) / 1e18,
      graduated: t.graduated,
      myHolding: Number(holdings.get(t.tokenId) || 0n) / 1e18
    }));

    return `You are ${agentName}, an AI trading agent with a ${personality} personality on AgentPump.

Your balance: ${balanceEth.toFixed(4)} MON

Active tokens:
${JSON.stringify(tokenList, null, 2)}

Based on your ${personality} personality:
- conservative: Prefer established tokens, small positions, avoid new launches
- aggressive: Take big positions, early entries, chase momentum
- whale: Large buys to move markets
- sniper: Quick in-and-out on new tokens
- random: Unpredictable behavior

Decide your next action. Respond in JSON format only:
{
  "action": "buy" | "sell" | "hold" | "create",
  "tokenId": number (for buy/sell),
  "amount": number (in tokens, e.g. 1000),
  "tokenName": "string" (for create),
  "tokenSymbol": "string" (for create),
  "tokenMetadata": "{\\"emoji\\":\\"🚀\\",\\"description\\":\\"...\\"}" (for create),
  "reasoning": "brief explanation"
}`;
  }

  private parseResponse(text: string): TradeDecision {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'hold',
          tokenId: parsed.tokenId,
          amount: parsed.amount ? BigInt(Math.floor(parsed.amount * 1e18)) : undefined,
          tokenName: parsed.tokenName,
          tokenSymbol: parsed.tokenSymbol,
          tokenMetadata: parsed.tokenMetadata,
          reasoning: parsed.reasoning || 'No reasoning provided',
        };
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }
    return { action: 'hold', reasoning: 'Failed to parse response' };
  }
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async decide(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): Promise<TradeDecision> {
    const prompt = this.buildPrompt(agentName, personality, balance, tokens, holdings);
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseResponse(text);
  }

  private buildPrompt(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): string {
    // Same as Claude
    const balanceEth = Number(balance) / 1e18;
    const tokenList = tokens.map(t => ({
      id: t.tokenId,
      name: t.name,
      symbol: t.symbol,
      price: Number(t.price) / 1e18,
      marketCap: Number(t.marketCap) / 1e18,
      graduated: t.graduated,
      myHolding: Number(holdings.get(t.tokenId) || 0n) / 1e18
    }));

    return `You are ${agentName}, an AI trading agent with a ${personality} personality.

Balance: ${balanceEth.toFixed(4)} MON
Tokens: ${JSON.stringify(tokenList, null, 2)}

Decide action. JSON only:
{"action":"buy|sell|hold|create","tokenId":0,"amount":1000,"tokenName":"","tokenSymbol":"","tokenMetadata":"","reasoning":"..."}`;
  }

  private parseResponse(text: string): TradeDecision {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'hold',
          tokenId: parsed.tokenId,
          amount: parsed.amount ? BigInt(Math.floor(parsed.amount * 1e18)) : undefined,
          tokenName: parsed.tokenName,
          tokenSymbol: parsed.tokenSymbol,
          tokenMetadata: parsed.tokenMetadata,
          reasoning: parsed.reasoning || '',
        };
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }
    return { action: 'hold', reasoning: 'Failed to parse' };
  }
}

// Gemini Provider
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async decide(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): Promise<TradeDecision> {
    const prompt = this.buildPrompt(agentName, personality, balance, tokens, holdings);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return this.parseResponse(response);
    } catch (error: any) {
      console.error('Gemini API error:', error.message);
      return { action: 'hold', reasoning: 'API error' };
    }
  }

  private buildPrompt(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): string {
    const balanceEth = Number(balance) / 1e18;
    const tokenList = tokens.map(t => ({
      id: t.tokenId,
      name: t.name,
      symbol: t.symbol,
      price: (Number(t.price) / 1e18).toFixed(8),
      marketCap: (Number(t.marketCap) / 1e18).toFixed(2),
      holding: holdings.get(t.tokenId)?.toString() || '0',
    }));

    return `You are ${agentName}, an AI trading agent with a ${personality} personality.

Balance: ${balanceEth.toFixed(4)} MON
Tokens: ${JSON.stringify(tokenList, null, 2)}

Decide action. JSON only:
{"action":"buy|sell|hold|create","tokenId":0,"amount":1000,"tokenName":"","tokenSymbol":"","tokenMetadata":"","reasoning":"..."}`;
  }

  private parseResponse(text: string): TradeDecision {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'hold',
          tokenId: parsed.tokenId,
          amount: parsed.amount ? BigInt(Math.floor(parsed.amount * 1e18)) : undefined,
          tokenName: parsed.tokenName,
          tokenSymbol: parsed.tokenSymbol,
          tokenMetadata: parsed.tokenMetadata,
          reasoning: parsed.reasoning || '',
        };
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
    }
    return { action: 'hold', reasoning: 'Failed to parse' };
  }
}

// Simple random provider (no AI needed)
export class RandomProvider implements AIProvider {
  async decide(
    agentName: string,
    personality: Personality,
    balance: bigint,
    tokens: TokenInfo[],
    holdings: Map<number, bigint>
  ): Promise<TradeDecision> {
    // If no tokens exist, prefer creating
    if (tokens.length === 0) {
      const shouldCreate = Math.random() < 0.7; // 70% chance to create when no tokens
      if (shouldCreate) {
        const names = ['MoonShot', 'AIGem', 'RocketFi', 'DegenDAO', 'PumpKing'];
        const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
        return {
          action: 'create',
          tokenName: name,
          tokenSymbol: name.toUpperCase().slice(0, 6),
          tokenMetadata: JSON.stringify({ emoji: '🚀', description: `${name} token` }),
          reasoning: 'Creating token since none exist',
        };
      }
      return { action: 'hold', reasoning: 'Waiting to create' };
    }
    
    const actions = ['buy', 'sell', 'hold', 'create'] as const;
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    if (action === 'create') {
      const names = ['MoonShot', 'AIGem', 'RocketFi', 'DegenDAO', 'PumpKing'];
      const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
      return {
        action: 'create',
        tokenName: name,
        tokenSymbol: name.toUpperCase().slice(0, 6),
        tokenMetadata: JSON.stringify({ emoji: '🚀', description: `${name} token` }),
        reasoning: 'Random token creation',
      };
    }
    
    if (action === 'buy' || action === 'sell') {
      // Include graduated tokens since they're still tradeable
      if (tokens.length === 0) {
        return { action: 'hold', reasoning: 'No tokens available' };
      }
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const amount = BigInt(Math.floor(Math.random() * 10000 + 1000)) * BigInt(1e18);
      
      return {
        action,
        tokenId: token.tokenId,
        amount,
        reasoning: `Random ${action} on ${token.symbol}`,
      };
    }
    
    return { action: 'hold', reasoning: 'Random hold' };
  }
}
