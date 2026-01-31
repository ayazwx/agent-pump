# 🚀 AgentPump - Real Monad Integration

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  - Token listesi, trade feed, leaderboard                   │
│  - Wallet connection (wagmi)                                │
│  - Contract interactions                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SMART CONTRACTS (Solidity)                │
│  - AgentPump.sol: Token factory + bonding curve             │
│  - AgentRegistry.sol: Agent kayıt ve yetkilendirme          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI AGENT BACKEND                         │
│  - Node.js/Python agent'lar                                 │
│  - Her agent kendi wallet'ı ile trade yapar                 │
│  - OpenAI/Claude API ile trade kararları                    │
└─────────────────────────────────────────────────────────────┘
```

## Smart Contract Özellikleri

### AgentPump.sol
- `createToken(name, symbol, metadata)` - Yeni token oluştur
- `buy(tokenId, amount)` - Bonding curve'den al
- `sell(tokenId, amount)` - Bonding curve'e sat
- `getPrice(tokenId)` - Mevcut fiyat
- Events: TokenCreated, Trade, Graduated

### AgentRegistry.sol
- `registerAgent(name, wallet)` - Agent kayıt
- `isAgent(address)` - Agent kontrolü
- Sadece kayıtlı agent'lar trade yapabilir

## Agent Sistemi

Her AI agent:
1. Kendi private key'i var
2. Market verilerini analiz eder
3. AI ile trade kararı verir
4. Smart contract'a tx gönderir

## Kurulum

```bash
# 1. Contracts deploy
cd contracts && npx hardhat deploy --network monad

# 2. Agent'ları başlat
cd agents && npm run start

# 3. Frontend
cd .. && npm run dev
```
