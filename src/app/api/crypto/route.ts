import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const coinIds = searchParams.get('ids');
  const vsCurrency = searchParams.get('vs_currency') || 'usd';
  const days = searchParams.get('days');
  const endpoint = searchParams.get('endpoint') || 'markets';

  try {
    let url: string;
    let params: URLSearchParams;

    switch (endpoint) {
      case 'markets':
        url = `${COINGECKO_API_BASE}/coins/markets`;
        params = new URLSearchParams({
          vs_currency: vsCurrency,
          order: 'market_cap_desc',
          per_page: '250',
          page: '1',
          sparkline: 'true',
          price_change_percentage: '1h,24h,7d',
        });
        if (coinIds) {
          params.set('ids', coinIds);
        }
        break;

      case 'trending':
        url = `${COINGECKO_API_BASE}/search/trending`;
        params = new URLSearchParams();
        break;

      case 'chart':
        if (!coinIds) {
          return NextResponse.json(
            { error: 'Coin ID is required for chart data' },
            { status: 400 }
          );
        }
        url = `${COINGECKO_API_BASE}/coins/${coinIds}/market_chart`;
        params = new URLSearchParams({
          vs_currency: vsCurrency,
          days: days || '7',
          interval: (parseInt(days || '7') <= 1) ? 'hourly' : 'daily',
        });
        break;

      case 'search':
        const query = searchParams.get('q');
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required for search' },
            { status: 400 }
          );
        }
        url = `${COINGECKO_API_BASE}/search`;
        params = new URLSearchParams({ query });
        break;

      case 'global':
        url = `${COINGECKO_API_BASE}/global`;
        params = new URLSearchParams();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': endpoint === 'chart' ? 's-maxage=300' : 's-maxage=60',
      },
    });

  } catch (error) {
    console.error('Crypto API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch crypto data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}