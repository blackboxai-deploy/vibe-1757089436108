'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { subscriptionService } from '@/lib/subscriptionService';
import type { CryptoAsset } from '@/lib/cryptoApi';

interface CryptoCardProps {
  asset: CryptoAsset;
  isSubscribed?: boolean;
  onSubscriptionChange?: (cryptoId: string, isSubscribed: boolean) => void;
  onCardClick?: (asset: CryptoAsset) => void;
}

export function CryptoCard({ 
  asset, 
  isSubscribed = false, 
  onSubscriptionChange,
  onCardClick 
}: CryptoCardProps) {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [loading, setLoading] = useState(false);

  const handleSubscriptionToggle = async (checked: boolean) => {
    setLoading(true);
    
    try {
      if (checked) {
        subscriptionService.addSubscription({
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          image: asset.image,
        });
      } else {
        subscriptionService.removeSubscription(asset.id);
      }
      
      setSubscribed(checked);
      onSubscriptionChange?.(asset.id, checked);
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return price.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const priceChange24h = asset.price_change_percentage_24h || 0;
  const isPositiveChange = priceChange24h >= 0;
  const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';
  const changeBgColor = isPositiveChange ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20"
      onClick={() => onCardClick?.(asset)}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-3 flex-1">
          <img 
            src={asset.image} 
            alt={asset.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0d8ae010-66f0-4499-a720-6bf50a20f18f.png 2).toUpperCase()}+Crypto+Logo`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{asset.name}</h3>
            <p className="text-sm text-muted-foreground uppercase">{asset.symbol}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {asset.market_cap_rank && (
            <Badge variant="secondary" className="text-xs">
              #{asset.market_cap_rank}
            </Badge>
          )}
          <Switch
            checked={subscribed}
            onCheckedChange={handleSubscriptionToggle}
            disabled={loading}
            className="data-[state=checked]:bg-green-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{formatPrice(asset.current_price)}</p>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${changeBgColor}`}>
              <span className={changeColor}>
                {isPositiveChange ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>
          
          {asset.sparkline_in_7d?.price && (
            <div className="w-20 h-12">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <polyline
                  fill="none"
                  stroke={isPositiveChange ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={
                    asset.sparkline_in_7d.price
                      .slice(-20) // Use last 20 points for mini chart
                      .map((price, index) => {
                        const x = (index / 19) * 100;
                        const sparklineData = asset.sparkline_in_7d?.price?.slice(-20) || [];
                        const minPrice = Math.min(...sparklineData);
                        const maxPrice = Math.max(...sparklineData);
                        const y = 45 - ((price - minPrice) / (maxPrice - minPrice)) * 40;
                        return `${x},${y}`;
                      })
                      .join(' ')
                  }
                />
              </svg>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Market Cap</p>
            <p className="font-medium">{formatMarketCap(asset.market_cap || 0)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">24h Volume</p>
            <p className="font-medium">{formatMarketCap(asset.total_volume || 0)}</p>
          </div>
        </div>

        {asset.high_24h && asset.low_24h && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">24h Range</p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-red-500">{formatPrice(asset.low_24h)}</span>
              <div className="flex-1 h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-full relative">
                <div 
                  className="absolute w-2 h-2 bg-white border-2 border-gray-800 rounded-full transform -translate-y-0 -translate-x-1"
                  style={{
                    left: `${((asset.current_price - asset.low_24h) / (asset.high_24h - asset.low_24h)) * 100}%`
                  }}
                />
              </div>
              <span className="text-green-500">{formatPrice(asset.high_24h)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}