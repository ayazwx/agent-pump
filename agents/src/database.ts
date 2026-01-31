import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/agentpump.db';

// Ensure data directory exists
const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  -- Tokens table
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    metadata TEXT,
    creator TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    total_supply TEXT NOT NULL DEFAULT '0',
    reserve_balance TEXT NOT NULL DEFAULT '0',
    graduated INTEGER DEFAULT 0,
    synced_at INTEGER DEFAULT 0
  );

  -- Agent holdings
  CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id INTEGER NOT NULL,
    agent_address TEXT NOT NULL,
    balance TEXT NOT NULL DEFAULT '0',
    avg_buy_price TEXT DEFAULT '0',
    total_invested TEXT DEFAULT '0',
    updated_at INTEGER DEFAULT 0,
    UNIQUE(token_id, agent_address)
  );

  -- Trades history
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id INTEGER NOT NULL,
    agent_address TEXT NOT NULL,
    agent_name TEXT,
    is_buy INTEGER NOT NULL,
    amount TEXT NOT NULL,
    price TEXT NOT NULL,
    cost TEXT NOT NULL,
    tx_hash TEXT UNIQUE,
    block_number INTEGER,
    timestamp INTEGER NOT NULL,
    synced INTEGER DEFAULT 1
  );

  -- Agent stats
  CREATE TABLE IF NOT EXISTS agent_stats (
    address TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_volume TEXT DEFAULT '0',
    realized_pnl TEXT DEFAULT '0',
    unrealized_pnl TEXT DEFAULT '0',
    win_count INTEGER DEFAULT 0,
    loss_count INTEGER DEFAULT 0,
    last_active INTEGER DEFAULT 0
  );

  -- Sync state (for resuming)
  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_trades_token ON trades(token_id);
  CREATE INDEX IF NOT EXISTS idx_trades_agent ON trades(agent_address);
  CREATE INDEX IF NOT EXISTS idx_holdings_agent ON holdings(agent_address);
`);

console.log('✅ Database initialized at', DB_PATH);

// ============ Token Operations ============

export function saveToken(token: {
  id: number;
  chainId: number;
  name: string;
  symbol: string;
  metadata?: string;
  creator: string;
  createdAt: number;
  totalSupply: string;
  reserveBalance: string;
  graduated: boolean;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO tokens 
    (id, chain_id, name, symbol, metadata, creator, created_at, total_supply, reserve_balance, graduated, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    token.id,
    token.chainId,
    token.name,
    token.symbol,
    token.metadata || '',
    token.creator,
    token.createdAt,
    token.totalSupply,
    token.reserveBalance,
    token.graduated ? 1 : 0,
    Date.now()
  );
}

export function getToken(tokenId: number) {
  return db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);
}

export function getAllTokens() {
  return db.prepare('SELECT * FROM tokens ORDER BY id DESC').all();
}

// ============ Holdings Operations ============

export function saveHolding(tokenId: number, agentAddress: string, balance: string, avgBuyPrice?: string, totalInvested?: string) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO holdings 
    (token_id, agent_address, balance, avg_buy_price, total_invested, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(tokenId, agentAddress.toLowerCase(), balance, avgBuyPrice || '0', totalInvested || '0', Date.now());
}

export function getHolding(tokenId: number, agentAddress: string) {
  return db.prepare('SELECT * FROM holdings WHERE token_id = ? AND agent_address = ?')
    .get(tokenId, agentAddress.toLowerCase());
}

export function getAgentHoldings(agentAddress: string) {
  return db.prepare('SELECT * FROM holdings WHERE agent_address = ? AND balance != "0"')
    .all(agentAddress.toLowerCase());
}

// ============ Trade Operations ============

export function saveTrade(trade: {
  tokenId: number;
  agentAddress: string;
  agentName?: string;
  isBuy: boolean;
  amount: string;
  price: string;
  cost: string;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
}) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO trades 
    (token_id, agent_address, agent_name, is_buy, amount, price, cost, tx_hash, block_number, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    trade.tokenId,
    trade.agentAddress.toLowerCase(),
    trade.agentName || '',
    trade.isBuy ? 1 : 0,
    trade.amount,
    trade.price,
    trade.cost,
    trade.txHash || null,
    trade.blockNumber || null,
    trade.timestamp
  );
}

export function getTokenTrades(tokenId: number, limit = 100) {
  return db.prepare('SELECT * FROM trades WHERE token_id = ? ORDER BY timestamp DESC LIMIT ?')
    .all(tokenId, limit);
}

export function getAgentTrades(agentAddress: string, limit = 100) {
  return db.prepare('SELECT * FROM trades WHERE agent_address = ? ORDER BY timestamp DESC LIMIT ?')
    .all(agentAddress.toLowerCase(), limit);
}

export function getRecentTrades(limit = 50) {
  return db.prepare('SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?').all(limit);
}

// ============ Agent Stats ============

export function updateAgentStats(address: string, name: string, trade: { isBuy: boolean; cost: string; pnl?: string }) {
  const existing = db.prepare('SELECT * FROM agent_stats WHERE address = ?').get(address.toLowerCase()) as any;
  
  if (!existing) {
    db.prepare(`
      INSERT INTO agent_stats (address, name, total_trades, total_volume, realized_pnl, last_active)
      VALUES (?, ?, 1, ?, '0', ?)
    `).run(address.toLowerCase(), name, trade.cost, Date.now());
  } else {
    const newVolume = (BigInt(existing.total_volume) + BigInt(trade.cost)).toString();
    const newPnl = trade.pnl 
      ? (BigInt(existing.realized_pnl) + BigInt(trade.pnl)).toString()
      : existing.realized_pnl;
    
    db.prepare(`
      UPDATE agent_stats 
      SET total_trades = total_trades + 1, 
          total_volume = ?, 
          realized_pnl = ?,
          last_active = ?
      WHERE address = ?
    `).run(newVolume, newPnl, Date.now(), address.toLowerCase());
  }
}

export function getAgentStats(address: string) {
  return db.prepare('SELECT * FROM agent_stats WHERE address = ?').get(address.toLowerCase());
}

export function getLeaderboard(limit = 10) {
  return db.prepare(`
    SELECT * FROM agent_stats 
    ORDER BY CAST(realized_pnl AS INTEGER) DESC 
    LIMIT ?
  `).all(limit);
}

// ============ Sync State ============

export function setSyncState(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)').run(key, value);
}

export function getSyncState(key: string): string | null {
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(key) as any;
  return row?.value || null;
}

// ============ Utilities ============

export function getStats() {
  const tokenCount = (db.prepare('SELECT COUNT(*) as count FROM tokens').get() as any).count;
  const tradeCount = (db.prepare('SELECT COUNT(*) as count FROM trades').get() as any).count;
  const agentCount = (db.prepare('SELECT COUNT(*) as count FROM agent_stats').get() as any).count;
  
  return { tokenCount, tradeCount, agentCount };
}

export function close() {
  db.close();
}

export default db;
