import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const coinIds = searchParams.get('coins');
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Mock news data for demonstration
    // In a real implementation, you would integrate with news APIs like:
    // - CryptoNews API
    // - NewsAPI
    // - CoinDesk API
    const mockNews = [
      {
        title: "Bitcoin Institutional Adoption Reaches New Heights",
        description: "Major corporations continue to add Bitcoin to their balance sheets, signaling growing institutional confidence in cryptocurrency.",
        url: "https://example.com/bitcoin-adoption",
        source: "CoinDesk",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/24030ac1-3d92-434a-bc81-a94811654430.png",
        category: "market",
        sentiment: "positive" as const,
        coins: ["bitcoin"],
      },
      {
        title: "Ethereum Layer 2 Solutions See Record Growth",
        description: "Layer 2 scaling solutions for Ethereum experience unprecedented adoption as users seek lower fees and faster transactions.",
        url: "https://example.com/ethereum-layer2",
        source: "CoinTelegraph",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/4f8fa87f-778d-412e-a87a-30313226d43f.png",
        category: "technology",
        sentiment: "positive" as const,
        coins: ["ethereum"],
      },
      {
        title: "DeFi Protocols Report Strong Q4 Performance",
        description: "Decentralized Finance platforms show resilient growth with total value locked increasing across major protocols.",
        url: "https://example.com/defi-performance",
        source: "The Block",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ca390fcc-3644-43db-b57b-94ebb2a1c26f.png",
        category: "defi",
        sentiment: "positive" as const,
        coins: ["ethereum", "solana", "avalanche"],
      },
      {
        title: "Regulatory Framework Updates Provide Market Clarity",
        description: "New cryptocurrency regulations offer clearer guidelines for institutional participation and mainstream adoption.",
        url: "https://example.com/crypto-regulation",
        source: "Crypto News",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f4ebabc4-5fc6-48dd-b97c-34ff89ed3f2b.png",
        category: "regulation",
        sentiment: "neutral" as const,
        coins: ["bitcoin", "ethereum"],
      },
      {
        title: "NFT Market Evolution: Utility-Focused Projects Rise",
        description: "Non-fungible token projects with real-world utility gain traction as the market matures beyond speculative trading.",
        url: "https://example.com/nft-evolution",
        source: "NFT News",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9645f29c-6d3a-44bd-a1cc-ebb8f5a07c8f.png",
        category: "nft",
        sentiment: "positive" as const,
        coins: ["ethereum"],
      },
      {
        title: "Web3 Gaming Tokens Show Strong Market Performance",
        description: "Play-to-earn and blockchain gaming tokens experience significant growth as gaming adoption increases.",
        url: "https://example.com/web3-gaming",
        source: "Gaming Crypto",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/efe30512-100d-40ae-bf60-37e4f155b4a5.png",
        category: "gaming",
        sentiment: "positive" as const,
        coins: ["axie-infinity", "the-sandbox", "decentraland"],
      },
      {
        title: "Central Bank Digital Currencies Gain Global Momentum",
        description: "Multiple countries accelerate CBDC development programs as digital currency adoption becomes mainstream.",
        url: "https://example.com/cbdc-momentum",
        source: "Digital Currency Report",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a8c97e7a-6c8a-426e-be84-d1212002444c.png",
        category: "cbdc",
        sentiment: "neutral" as const,
        coins: ["bitcoin", "ethereum"],
      },
      {
        title: "Cryptocurrency Market Cap Reaches Historic Milestone",
        description: "Total cryptocurrency market capitalization hits new record as institutional and retail adoption continues to grow.",
        url: "https://example.com/market-milestone",
        source: "Market Analysis",
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
        image: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/31a9dad1-e5fc-4041-b921-cf95166be81f.png",
        category: "market",
        sentiment: "positive" as const,
        coins: ["bitcoin", "ethereum", "binancecoin"],
      },
    ];

    // Filter by category
    let filteredNews = mockNews;
    if (category && category !== 'all') {
      filteredNews = filteredNews.filter(article => article.category === category);
    }

    // Filter by coins
    if (coinIds) {
      const coinList = coinIds.split(',');
      filteredNews = filteredNews.filter(article =>
        article.coins.some(coin => coinList.includes(coin))
      );
    }

    // Search by query
    if (query) {
      filteredNews = filteredNews.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase()) ||
        article.category?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Sort by date
    filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const articles = filteredNews.slice(startIndex, endIndex);

    return NextResponse.json({
      articles,
      totalResults: filteredNews.length,
      page,
      hasMore: endIndex < filteredNews.length,
    });

  } catch (error) {
    console.error('News API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}