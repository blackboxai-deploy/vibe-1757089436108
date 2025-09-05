import axios from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CryptoPriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TrendingCrypto {
  coins: Array<{
    item: {
      id: string;
      coin_id: number;
      name: string;
      symbol: string;
      market_cap_rank: number;
      thumb: string;
      small: string;
      large: string;
      slug: string;
      price_btc: number;
      score: number;
    };
  }>;
}

class CryptoAPI {
  private baseURL = COINGECKO_API_BASE;

  // Get market data for specific coins
  async getMarketData(coinIds: string[], vsCurrency = 'usd'): Promise<CryptoAsset[]> {
    try {
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: vsCurrency,
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: true,
          price_change_percentage: '1h,24h,7d',
          locale: 'en',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Get trending coins
  async getTrendingCoins(): Promise<TrendingCrypto> {
    try {
      const response = await axios.get(`${this.baseURL}/search/trending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw error;
    }
  }

  // Get price history for a specific coin
  async getPriceHistory(
    coinId: string, 
    days: number = 7, 
    vsCurrency = 'usd'
  ): Promise<CryptoPriceHistory> {
    try {
      const response = await axios.get(`${this.baseURL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: vsCurrency,
          days: days,
          interval: days <= 1 ? 'hourly' : 'daily',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }

  // Search for coins
  async searchCoins(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          query: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw error;
    }
  }

  // Get top coins by market cap
  async getTopCoins(limit = 100, vsCurrency = 'usd'): Promise<CryptoAsset[]> {
    try {
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: vsCurrency,
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: '1h,24h,7d',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw error;
    }
  }

  // Get global crypto statistics
  async getGlobalStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/global`);
      return response.data;
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw error;
    }
  }
}

export const cryptoAPI = new CryptoAPI();