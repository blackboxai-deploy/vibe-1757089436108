'use client';

import { useState, useEffect, useCallback } from 'react';
import { cryptoAPI, type CryptoAsset, type TrendingCrypto } from '@/lib/cryptoApi';
import { subscriptionService } from '@/lib/subscriptionService';

export interface UseCryptoDataResult {
  assets: CryptoAsset[];
  trendingCoins: TrendingCrypto | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useCryptoData(autoRefresh = true, refreshInterval = 30000): UseCryptoDataResult {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCrypto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const subscribedIds = subscriptionService.getSubscribedIds();
      
      // If no subscriptions, get top coins
      const coinIds = subscribedIds.length > 0 ? subscribedIds : [
        'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
        'polkadot', 'chainlink', 'litecoin', 'bitcoin-cash', 'stellar'
      ];

      const [marketData, trending] = await Promise.all([
        cryptoAPI.getMarketData(coinIds),
        cryptoAPI.getTrendingCoins().catch(() => null), // Don't fail if trending fails
      ]);

      setAssets(marketData);
      setTrendingCoins(trending);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  return {
    assets,
    trendingCoins,
    loading,
    error,
    refreshData,
    lastUpdated,
  };
}

export interface UseTopCoinsResult {
  topCoins: CryptoAsset[];
  loading: boolean;
  error: string | null;
  refreshTopCoins: () => Promise<void>;
}

export function useTopCoins(limit = 50): UseTopCoinsResult {
  const [topCoins, setTopCoins] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTopCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const coins = await cryptoAPI.getTopCoins(limit);
      setTopCoins(coins);
    } catch (err) {
      console.error('Error fetching top coins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top coins');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refreshTopCoins();
  }, [refreshTopCoins]);

  return {
    topCoins,
    loading,
    error,
    refreshTopCoins,
  };
}

export interface UseCoinSearchResult {
  searchResults: any[];
  loading: boolean;
  error: string | null;
  searchCoins: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useCoinSearch(): UseCoinSearchResult {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCoins = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const results = await cryptoAPI.searchCoins(query);
      setSearchResults(results.coins || []);
    } catch (err) {
      console.error('Error searching coins:', err);
      setError(err instanceof Error ? err.message : 'Failed to search coins');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchCoins,
    clearResults,
  };
}