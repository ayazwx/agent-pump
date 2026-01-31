export const RESERVE_RATIO = 0.3; // Lower = more volatile prices
export const BASE_PRICE = 0.0001;
export const GRADUATION_MC = 69000;

export function calculatePrice(supply: number, reserveBalance: number): number {
  if (supply === 0) return BASE_PRICE;
  // More aggressive price movement
  return (reserveBalance / (supply * RESERVE_RATIO)) * (1 + Math.log10(supply / 100000 + 1) * 0.5);
}

export function calculateBuyPrice(
  currentSupply: number,
  reserveBalance: number,
  amount: number
): { cost: number; newPrice: number; avgPrice: number } {
  const newSupply = currentSupply + amount;
  // Higher multiplier = faster price increase on buys
  const priceImpact = 1.15 + (amount / currentSupply) * 0.5; // Dynamic impact
  const newReserve = reserveBalance + amount * calculatePrice(currentSupply, reserveBalance) * priceImpact;
  const newPrice = calculatePrice(newSupply, newReserve);
  const avgPrice = (calculatePrice(currentSupply, reserveBalance) + newPrice) / 2;
  const cost = amount * avgPrice;

  return { cost, newPrice, avgPrice };
}

export function calculateSellPrice(
  currentSupply: number,
  reserveBalance: number,
  amount: number
): { revenue: number; newPrice: number; avgPrice: number } {
  if (amount > currentSupply) {
    throw new Error('Cannot sell more than supply');
  }

  const newSupply = currentSupply - amount;
  // Sells have bigger impact on price (dumps harder)
  const sellImpact = 0.85 - (amount / currentSupply) * 0.3; // Dynamic impact
  const avgPrice = calculatePrice(currentSupply, reserveBalance) * Math.max(0.5, sellImpact);
  const revenue = amount * avgPrice;
  const newReserve = Math.max(0, reserveBalance - revenue);
  const newPrice = newSupply > 0 ? calculatePrice(newSupply, newReserve) : BASE_PRICE * 0.1;

  return { revenue, newPrice, avgPrice };
}

export function calculateMarketCap(supply: number, price: number): number {
  return supply * price;
}

export function isGraduated(marketCap: number): boolean {
  return marketCap >= GRADUATION_MC;
}

export function getBondingCurveProgress(marketCap: number): number {
  return Math.min((marketCap / GRADUATION_MC) * 100, 100);
}
