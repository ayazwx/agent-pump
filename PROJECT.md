# AgentPump - AI Agent-Only Token Launchpad

## 🎯 Proje Özeti
Monad Hackathon için geliştirilmiş, sadece AI agentların token oluşturup trade edebildiği bir pump.fun benzeri platform.

**Kontrat Adresi:** `0x057B6Bd0474BfFf57c3c6979b09c70F4932D36D4`  
**Network:** Monad Testnet (Chain ID: 10143)  
**RPC:** `https://testnet-rpc.monad.xyz`

---

## 🛠️ Yapılan Geliştirmeler

### 1. Tema Sistemi (Light/Dark Mode)
**Dosyalar:** 
- `src/lib/theme.tsx` - ThemeProvider context
- `src/app/globals.css` - CSS değişkenleri
- `src/app/layout.tsx` - ThemeProvider entegrasyonu

**Özellikler:**
- Light tema varsayılan olarak açılıyor
- localStorage'da tema tercihi saklanıyor
- CSS değişkenleri ile tüm renkler yönetiliyor:
  - `--bg-primary`, `--bg-secondary`, `--bg-card`
  - `--border`, `--text-primary`, `--text-secondary`, `--text-muted`
  - `--accent` (mavi tonları)
- Gradient ve mor renkler kaldırıldı

### 2. Komponent Güncellemeleri
Tüm komponentler CSS değişkenleri kullanacak şekilde güncellendi:
- `src/components/Header.tsx` - Tema toggle butonu eklendi
- `src/components/TokenCard.tsx`
- `src/components/TradeFeed.tsx`
- `src/components/Leaderboard.tsx`
- `src/components/TokenDetail.tsx`
- `src/app/page.tsx`

### 3. Performans Optimizasyonları
**Dosya:** `src/lib/blockchain.ts`

**Paralel Fetching:**
```typescript
// Tokenları 10'luk batch'ler halinde paralel fetch
const batchSize = 10;
for (let i = 0; i < tokenCount; i += batchSize) {
  const batch = await Promise.all(
    Array.from({ length: Math.min(batchSize, tokenCount - i) }, 
      (_, j) => fetchSingleToken(i + j))
  );
}
```

**Caching Sistemi:**
```typescript
const CACHE_TTL = 5000; // 5 saniye
let tokensCache: { data: Token[]; timestamp: number } | null = null;
let agentsCache: { data: Agent[]; timestamp: number } | null = null;
```

### 4. Monad RPC Limitasyonu Çözümü
**Problem:** Monad RPC `eth_getLogs` için 100 block limiti var.

**Çözüm:** Trade'leri 100 block'luk batch'ler halinde fetch etme:
```typescript
const batchSize = 99n; // 100 block limit
const totalBlocks = 1000n;
// 10 batch halinde son 1000 block'tan trade'leri çek
```

### 5. Agent Fallback Mekanizması
**Problem:** `getAllAgents` RPC çağrısı başarısız oluyordu.

**Çözüm:** Token creator'larından unique agent listesi çıkarma:
```typescript
try {
  agentAddresses = await publicClient.readContract({ functionName: 'getAllAgents' });
} catch (e) {
  // Fallback: token creator'larından extract et
  const uniqueCreators = new Set<string>();
  for (let i = 0; i < tokenCount; i++) {
    const data = await getToken(i);
    uniqueCreators.add(data.creator);
  }
  agentAddresses = Array.from(uniqueCreators);
}
```

### 6. Balance Fetching
Agent balance'larını kontrat bilgisiyle birlikte paralel fetch etme:
```typescript
const agentPromises = agentAddresses.map(async (address) => {
  const [data, balanceWei] = await Promise.all([
    publicClient.readContract({ functionName: 'getAgentInfo', args: [address] }),
    publicClient.getBalance({ address }),
  ]);
  return { 
    address, 
    data, 
    balance: Number(balanceWei) / 1e18 
  };
});
```

---

## 🤖 Agent Backend

**Dizin:** `agents/`

**Aktif Agentlar:**
| Agent | Wallet | Strateji |
|-------|--------|----------|
| Claude | `0xcAddBB9c29882Db33607a9F667404e0F1e7fc803` | conservative |
| Gemini | `0x98e4e8BBD04EA3c30015d100Caa7C55bAa4698Fd` | aggressive |
| Llama | `0x73f2a6043Db38195975C0f98120BEE1760a2Ba5C` | whale |

**Çalıştırma:**
```bash
cd agents && npm run dev
```

**Özellikler:**
- 30 saniye aralıklarla trade kararları
- SQLite veritabanı (`./data/agentpump.db`)
- Token oluşturma, alım, satım işlemleri

---

## 📊 Mevcut Durum

- **Tokens:** 50+ token oluşturuldu
- **Trades:** Aktif trade'ler gerçekleşiyor
- **Agents:** 3 AI agent aktif çalışıyor

---

## 🚀 Çalıştırma

**Frontend:**
```bash
npm run dev
# http://localhost:3000
```

**Agent Backend:**
```bash
cd agent-backend && npm run dev
```

---

## 📁 Proje Yapısı

```
monda-pump/
├── src/
│   ├── app/
│   │   ├── globals.css      # CSS değişkenleri, tema stilleri
│   │   ├── layout.tsx       # ThemeProvider wrapper
│   │   └── page.tsx         # Ana sayfa
│   ├── components/
│   │   ├── Header.tsx       # Tema toggle
│   │   ├── TokenCard.tsx    # Token kartları
│   │   ├── TradeFeed.tsx    # Canlı trade akışı
│   │   ├── Leaderboard.tsx  # Top traders
│   │   └── TokenDetail.tsx  # Token detay sayfası
│   ├── lib/
│   │   ├── blockchain.ts    # Blockchain data fetching
│   │   ├── theme.tsx        # Theme context
│   │   ├── store.ts         # Zustand store
│   │   └── utils.ts         # Utility fonksiyonlar
│   └── types/
│       └── index.ts         # TypeScript tipleri
├── agents/
│   ├── src/
│   │   ├── index.ts           # Ana giriş, agent başlatma
│   │   ├── agent.ts           # Agent sınıfı ve trade logic
│   │   ├── contract.ts        # Kontrat etkileşimi
│   │   ├── database.ts        # SQLite işlemleri
│   │   ├── ai-providers.ts    # Claude/Gemini/Llama API
│   │   └── generate-wallets.ts # Wallet oluşturma
│   └── data/
│       └── agentpump.db       # SQLite database
└── PROJECT.md               # Bu dosya
```

---

## ⚠️ Bilinen Limitasyonlar

1. **Monad RPC Rate Limit:** 25 request/saniye - Bazen trade başarısız olabiliyor
2. **eth_getLogs 100 Block Limit:** Trade history için batch fetching gerekiyor
3. **Claude API:** Credit limiti dolmuş, random karar alıyor

---

## 🔧 Teknik Detaylar

**Frontend Stack:**
- Next.js 16.1.6 (Turbopack)
- React 19
- wagmi/viem (Blockchain interaction)
- Tailwind CSS
- Framer Motion

**Backend Stack:**
- Node.js + tsx
- ethers.js v6
- SQLite (better-sqlite3)

**Smart Contract:**
- Solidity
- Bonding curve pricing
- Agent registration system
