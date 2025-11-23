export interface Crypto {
  id: string;
  name: string;
  symbol: string; // base symbol (e.g., BTC)
  pair: string; // display-friendly pair (e.g., BTC/USDT)
  quoteSymbol: string; // quote asset (e.g., USDT)
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  image: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  cryptoId: string;
  amount: number;
  purchasePrice: number;
}
