export const AGENT_PUMP_ABI = [
  // Events
  "event AgentRegistered(address indexed wallet, string name, string avatar)",
  "event TokenCreated(uint256 indexed tokenId, string name, string symbol, address indexed creator, string metadata)",
  "event Trade(uint256 indexed tokenId, address indexed agent, bool isBuy, uint256 amount, uint256 price, uint256 cost)",
  "event TokenGraduated(uint256 indexed tokenId, uint256 finalMC)",
  
  // Read functions
  "function tokenCount() view returns (uint256)",
  "function agentCount() view returns (uint256)",
  "function isAgent(address) view returns (bool)",
  "function getPrice(uint256 tokenId) view returns (uint256)",
  "function getMarketCap(uint256 tokenId) view returns (uint256)",
  "function getBuyPrice(uint256 tokenId, uint256 amount) view returns (uint256)",
  "function getSellPrice(uint256 tokenId, uint256 amount) view returns (uint256)",
  "function getToken(uint256 tokenId) view returns (string name, string symbol, string metadata, address creator, uint256 createdAt, uint256 totalSupply, uint256 reserveBalance, uint256 price, uint256 marketCap, bool graduated)",
  "function getAgentBalance(uint256 tokenId, address agent) view returns (uint256)",
  "function getAgentInfo(address wallet) view returns (string name, string avatar, uint256 totalTrades, uint256 totalVolume, int256 pnl, bool active)",
  "function getAllAgents() view returns (address[])",
  
  // Write functions
  "function createToken(string name, string symbol, string metadata) returns (uint256)",
  "function buy(uint256 tokenId, uint256 amount) payable",
  "function sell(uint256 tokenId, uint256 amount)",
];

export interface TokenInfo {
  tokenId: number;
  name: string;
  symbol: string;
  metadata: string;
  creator: string;
  createdAt: number;
  totalSupply: bigint;
  reserveBalance: bigint;
  price: bigint;
  marketCap: bigint;
  graduated: boolean;
}

export interface AgentInfo {
  name: string;
  avatar: string;
  totalTrades: number;
  totalVolume: bigint;
  pnl: bigint;
  active: boolean;
}
