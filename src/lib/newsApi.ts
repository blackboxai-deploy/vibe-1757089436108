export interface CryptoNews {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  image?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  coins?: string[];
}

export interface NewsResponse {
  articles: CryptoNews[];
  totalResults: number;
  page: number;
}

class NewsAPI {
  // Since we don't have a real news API key, we'll simulate news data
  // In a real implementation, you'd use services like:
  // - CryptoNews API
  // - NewsAPI
  // - CoinDesk API
  // - CoinTelegraph API

  private generateMockNews(symbols: string[] = []): CryptoNews[] {
    const newsTemplates = [
      {
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description: "Major institutions continue to add Bitcoin to their balance sheets, driving unprecedented demand and price growth.",
        category: "market",
        sentiment: "positive" as const,
        coins: ["bitcoin"],
      },
      {
        title: "Ethereum 2.0 Staking Rewards Attract More Validators",
        description: "The Ethereum network sees increased participation in staking as more validators join the network for attractive rewards.",
        category: "technology",
        sentiment: "positive" as const,
        coins: ["ethereum"],
      },
      {
        title: "DeFi Market Sees 40% Growth in Total Value Locked",
        description: "Decentralized Finance protocols experience significant growth as users seek higher yields and financial autonomy.",
        category: "defi",
        sentiment: "positive" as const,
        coins: ["ethereum", "solana", "avalanche"],
      },
      {
        title: "Regulatory Clarity Boosts Crypto Market Confidence",
        description: "New regulatory guidelines provide much-needed clarity for cryptocurrency operations and institutional adoption.",
        category: "regulation",
        sentiment: "positive" as const,
        coins: ["bitcoin", "ethereum"],
      },
      {
        title: "NFT Sales Surge as Digital Art Market Expands",
        description: "Non-fungible tokens see renewed interest with major brands entering the space and creating digital collectibles.",
        category: "nft",
        sentiment: "positive" as const,
        coins: ["ethereum"],
      },
      {
        title: "Altcoin Season: Small-Cap Tokens Outperform Bitcoin",
        description: "Alternative cryptocurrencies show strong performance as investors diversify their portfolios beyond Bitcoin.",
        category: "market",
        sentiment: "positive" as const,
        coins: ["cardano", "polkadot", "chainlink"],
      },
      {
        title: "Central Bank Digital Currencies Gain Momentum Globally",
        description: "Multiple countries accelerate their CBDC development programs, signaling mainstream adoption of digital currencies.",
        category: "cbdc",
        sentiment: "neutral" as const,
        coins: ["bitcoin", "ethereum"],
      },
      {
        title: "Web3 Gaming Tokens Rally on Metaverse Developments",
        description: "Gaming cryptocurrencies experience significant gains as metaverse platforms announce new partnerships and features.",
        category: "gaming",
        sentiment: "positive" as const,
        coins: ["axie-infinity", "the-sandbox", "decentraland"],
      },
    ];

    return newsTemplates.map((template, index) => ({
      ...template,
      url: `https://example.com/news/${index + 1}`,
      source: ["CoinDesk", "CoinTelegraph", "Crypto News", "The Block"][index % 4],
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(), // Random time within last week
      image: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fb6e9258-e547-4c8d-9f5e-4ec348d9c5d9.png + 1}+Article+Image+with+Charts+and+Graphs`,
    })).filter(article => {
      // Filter by subscribed symbols if provided
      if (symbols.length === 0) return true;
      return article.coins?.some(coin => symbols.includes(coin));
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  // Get latest crypto news
  async getLatestNews(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<NewsResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allNews = this.generateMockNews();
      const filteredNews = category 
        ? allNews.filter(article => article.category === category)
        : allNews;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const articles = filteredNews.slice(startIndex, endIndex);

      return {
        articles,
        totalResults: filteredNews.length,
        page,
      };
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      throw error;
    }
  }

  // Get news for specific cryptocurrencies
  async getNewsForCoins(
    coinIds: string[],
    page: number = 1,
    limit: number = 10
  ): Promise<NewsResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allNews = this.generateMockNews(coinIds);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const articles = allNews.slice(startIndex, endIndex);

      return {
        articles,
        totalResults: allNews.length,
        page,
      };
    } catch (error) {
      console.error('Error fetching coin-specific news:', error);
      throw error;
    }
  }

  // Get trending news
  async getTrendingNews(): Promise<CryptoNews[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const allNews = this.generateMockNews();
      // Return top 5 most recent news as "trending"
      return allNews.slice(0, 5);
    } catch (error) {
      console.error('Error fetching trending news:', error);
      throw error;
    }
  }

  // Search news by keywords
  async searchNews(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<NewsResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const allNews = this.generateMockNews();
      const filteredNews = allNews.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase()) ||
        article.category?.toLowerCase().includes(query.toLowerCase())
      );

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const articles = filteredNews.slice(startIndex, endIndex);

      return {
        articles,
        totalResults: filteredNews.length,
        page,
      };
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  // Get news categories
  getNewsCategories(): string[] {
    return ['market', 'technology', 'defi', 'regulation', 'nft', 'gaming', 'cbdc'];
  }
}

export const newsAPI = new NewsAPI();