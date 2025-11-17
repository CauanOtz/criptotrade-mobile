import api from './config';

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/user', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const userApi = {
  getusers: () => api.get('/user'),
  getProfile: (id: string) => api.get(`/user/${id}`),
  updateProfile: (id: string, data: any) => api.put(`/user/${id}`, data),
  deleteAccount: (id: string) => api.delete(`/user/${id}`),
  updatePhoto: (id: string, file: any) => {
    const formData = new FormData();
    formData.append('photo', file as any);
    return api.post(`/user/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const marketApi = {
  getPrices: () => api.get('/crypto/prices'),
  getAllTickers: () => api.get('/crypto/tickers'),
  getTickerBySymbol: (symbol: string) => api.get(`/crypto/ticker/${symbol}`),
  getGainers: (limit = 5) => api.get('/crypto/gainers', { params: { limit } }),
  getLosers: (limit = 5) => api.get('/crypto/losers', { params: { limit } }),
  getTrending: (limit = 5) => api.get('/crypto/trending', { params: { limit } }),
  getOrderBook: (symbol: string, limit = 100) => api.get(`/crypto/orderbook/${symbol}`, { params: { limit } }),
  getRecentTrades: (symbol: string, limit = 500) => api.get(`/crypto/trades/${symbol}`, { params: { limit } }),
  getCoinData: (symbol: string) => api.get(`/market/coin/${symbol}`),
  getHistory: (symbol: string, timeframe: string) => api.get(`/market/history/${symbol}`, { params: { timeframe } }),
  getAllCryptos: () => api.get('/Crypto'),
  getCryptoIcon: (symbol: string) => `https://bin.bnbstatic.com/image/crypto/${symbol.toLowerCase()}.png`,
  getKlines: (symbol: string, interval = '15m', limit = 100) => api.get(`/crypto/klines/${symbol}`, { params: { interval, limit } }),
};

export const walletApi = {
  getAllWallets: () => api.get('/Wallet'),
  getWalletById: (id: string) => api.get(`/Wallet/${id}`),
  getuserWallets: (userId: string) => api.get(`/Wallet/user/${userId}`),
  createWallet: (walletData: any) => api.post('/Wallet', walletData),
  updateWallet: (walletData: any) => api.put(`/Wallet/${walletData.id}`, walletData),
  getWalletTransactions: (walletId: string) => api.get(`/Wallet/${walletId}/transactions`),
  addTransaction: (walletId: string, transactionData: any) => api.post(`/Wallet/${walletId}/transactions`, transactionData),
  getuserFiatWallets: (userId: string) => api.get(`/Wallet/user/${userId}/fiat`),
  getuserCryptoWallets: (userId: string) => api.get(`/Wallet/user/${userId}/crypto`),
  depositFiat: (data: any) => api.post('/Wallet/deposit/fiat', data),
  transferBetweenWallets: (data: any) => api.post('/Wallet/transfer', data),
};

export const transactionApi = {
  getAll: () => api.get('/transactions'),
  create: (data: any) => api.post('/transactions', data),
  getById: (id: string) => api.get(`/transactions/${id}`),
  update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

export const currencyApi = {
  getAllCurrencies: () => api.get('/Currency'),
  getCurrencyById: (id: string) => api.get(`/Currency/${id}`),
  createCurrency: (currencyData: any) => api.post('/Currency', currencyData),
  updateCurrency: (id: string, currencyData: any) => api.put(`/Currency/${id}`, currencyData),
  deleteCurrency: (id: string) => api.delete(`/Currency/${id}`),
};
