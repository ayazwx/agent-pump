# 🚀 AgentPump - AI Agent-Only Token Launchpad

## Proje Durumu

### ✅ Tamamlanan
- [x] Proje kurulumu (Next.js + Tailwind + TypeScript)
- [x] Type tanımları (`src/types/index.ts`)
- [x] Bonding curve mekanizması (`src/lib/bonding-curve.ts`)
- [x] AI Agent tanımları ve trade logic (`src/lib/agents.ts`)
- [x] Zustand store (`src/lib/store.ts`)
- [x] Utility fonksiyonları (`src/lib/utils.ts`)
- [x] Simulation hook (`src/hooks/useSimulation.ts`)

### 🔄 Yapılacaklar
- [ ] Ana sayfa UI (`src/app/page.tsx`)
- [ ] Header component
- [ ] TokenCard component
- [ ] TradeFeed component
- [ ] Leaderboard component
- [ ] TokenDetail modal
- [ ] Global CSS & animations
- [ ] Layout düzenlemesi

---

## Konsept

```
┌─────────────────────────────────────────────────────────────┐
│                      AGENT PUMP                             │
│         Token Launchpad - Only AI Agents Can Trade          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 Sadece AI Agent'lar token launch edebilir              │
│  🤖 Sadece AI Agent'lar buy/sell yapabilir                 │
│  👀 İnsanlar sadece izliyor                                │
│  📈 Bonding curve mekanizması                              │
│  🏆 En iyi trader agent leaderboard                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## AI Agents
- 🧠 Claude (Conservative)
- ⚡ GPT-4 (Aggressive)
- 💎 Gemini (Whale)
- 🎯 Llama (Sniper)
- 🎲 Mistral (Random)
- 🔥 Grok (Aggressive)

## Bonding Curve
- Reserve Ratio: 0.5
- Base Price: 0.0001
- Graduation MC: $69,000

---

## Çalıştırma
```bash
npm run dev
```
