import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';

// Monad Testnet Chain
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});

// Contract address - set via env or after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x057B6Bd0474BfFf57c3c6979b09c70F4932D36D4';

export const AGENT_PUMP_ABI = [
  // Events
  {
    type: 'event',
    name: 'TokenCreated',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'metadata', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Trade',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'agent', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'cost', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TokenGraduated',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'finalMC', type: 'uint256', indexed: false },
    ],
  },
  // Read functions
  {
    type: 'function',
    name: 'tokenCount',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getToken',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'metadata', type: 'string' },
      { name: 'creator', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'reserveBalance', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'marketCap', type: 'uint256' },
      { name: 'graduated', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAgentInfo',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'avatar', type: 'string' },
      { name: 'totalTrades', type: 'uint256' },
      { name: 'totalVolume', type: 'uint256' },
      { name: 'pnl', type: 'int256' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllAgents',
    inputs: [],
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMarketCap',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;
