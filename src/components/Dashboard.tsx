'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CryptoCard } from '@/components/CryptoCard';
import { PriceChart } from '@/components/PriceChart';
import { NewsPanel } from '@/components/NewsPanel';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useCryptoData, useTopCoins } from '@/hooks/useCryptoData';
import { useNotifications } from '@/hooks/useNotifications';
import { subscriptionService } from '@/lib/subscriptionService';
import type { CryptoAsset } from '@/lib/cryptoApi';

export function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [subscribedIds, setSubscribedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { 
    assets, 
    trendingCoins, 
    loading, 
    error, 
    refreshData, 
    lastUpdated 
  } = useCryptoData(true, 30000); // Auto-refresh every 30 seconds

  const { 
    topCoins, 
    loading: topCoinsLoading 
  } = useTopCoins(20);

  const { 
    checkPriceAlerts, 
    settings: notificationSettings 
  } = useNotifications();

  // Load subscriptions on mount and when refreshKey changes
  useEffect(() => {
    const ids = subscriptionService.getSubscribedIds();
    setSubscribedIds(ids);
  }, [refreshKey]);

  // Check for price alerts when crypto data updates
  useEffect(() => {
    if (assets.length > 0 && notificationSettings.enabled) {
      checkPriceAlerts(assets);
    }
  }, [assets, checkPriceAlerts, notificationSettings.enabled]);

  const handleSubscriptionChange = () => {
    const ids = subscriptionService.getSubscribedIds();
    setSubscribedIds(ids);
    setRefreshKey(prev => prev + 1);
    // Refresh data to show newly subscribed coins
    setTimeout(() => refreshData(), 500);
  };

  const handleCryptoCardClick = (asset: CryptoAsset) => {
    setSelectedCrypto(asset);
    setChartDialogOpen(true);
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const subscribedAssets = assets.filter(asset => subscribedIds.includes(asset.id));
  const displayAssets = subscribedAssets.length > 0 ? subscribedAssets : topCoins.slice(0, 12);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Crypto Trends Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Track, subscribe, and get notifications for your favorite cryptocurrencies
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm text-muted-foreground">
              <p>Last updated</p>
              <p>{formatLastUpdated(lastUpdated)}</p>
            </div>
            <Button onClick={refreshData} disabled={loading} variant="outline">
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                  <p className="text-2xl font-bold">{subscribedIds.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  📊
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trending Coins</p>
                  <p className="text-2xl font-bold">{trendingCoins?.coins?.length || 0}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  📈
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Notifications</p>
                  <p className="text-2xl font-bold">{notificationSettings.enabled ? 'ON' : 'OFF'}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  🔔
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Status</p>
                  <p className="text-2xl font-bold">{error ? '🔴' : '🟢'}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  💹
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Crypto Cards */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {subscribedAssets.length > 0 ? 'Your Cryptocurrencies' : 'Top Cryptocurrencies'}
              </h2>
              {subscribedAssets.length === 0 && (
                <Badge variant="secondary">
                  Subscribe to coins to see your personalized dashboard
                </Badge>
              )}
            </div>

            {error && (
              <Card className="mb-6">
                <CardContent className="p-6 text-center">
                  <p className="text-red-500">⚠️ {error}</p>
                  <Button onClick={refreshData} className="mt-4" variant="outline" size="sm">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {(loading || topCoinsLoading) && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-[200px]">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-3 bg-muted rounded w-1/4" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-6 bg-muted rounded w-1/3" />
                          <div className="h-4 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !topCoinsLoading && !error && displayAssets.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mb-4 opacity-50 text-4xl">📊</div>
                  <p className="text-muted-foreground mb-4">No cryptocurrency data available</p>
                  <Button onClick={refreshData} variant="outline">
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !topCoinsLoading && !error && displayAssets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayAssets.map((asset) => (
                  <CryptoCard
                    key={asset.id}
                    asset={asset}
                    isSubscribed={subscribedIds.includes(asset.id)}
                    onSubscriptionChange={handleSubscriptionChange}
                    onCardClick={handleCryptoCardClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="notifications">Alerts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subscriptions" className="mt-6">
                <SubscriptionManager onSubscriptionChange={handleSubscriptionChange} />
              </TabsContent>
              
              <TabsContent value="news" className="mt-6">
                <NewsPanel />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <NotificationCenter />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Chart Dialog */}
        <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Price Chart</DialogTitle>
            </DialogHeader>
            {selectedCrypto && (
              <PriceChart
                coinId={selectedCrypto.id}
                coinName={selectedCrypto.name}
                coinSymbol={selectedCrypto.symbol}
                currentPrice={selectedCrypto.current_price}
                priceChange24h={selectedCrypto.price_change_percentage_24h || 0}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}