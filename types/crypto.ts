export interface Crypto {
  id: string;
  name: string;
  symbol: string;
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
