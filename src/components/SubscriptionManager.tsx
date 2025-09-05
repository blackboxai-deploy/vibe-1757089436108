'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { subscriptionService, type Subscription } from '@/lib/subscriptionService';
import { useCoinSearch } from '@/hooks/useCryptoData';

interface SubscriptionManagerProps {
  onSubscriptionChange?: () => void;
}

export function SubscriptionManager({ onSubscriptionChange }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { searchResults, loading, searchCoins, clearResults } = useCoinSearch();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    const subs = subscriptionService.getSubscriptions();
    setSubscriptions(subs);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchCoins(query);
    } else {
      clearResults();
    }
  };

  const handleAddSubscription = (coin: any) => {
    subscriptionService.addSubscription({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.large || coin.thumb || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6073839e-2e5b-4c3c-ab65-c86455e93dca.png 2).toUpperCase() || 'C'}+Logo`,
    });
    
    loadSubscriptions();
    setSearchQuery('');
    clearResults();
    setIsDialogOpen(false);
    onSubscriptionChange?.();
  };

  const handleRemoveSubscription = (cryptoId: string) => {
    subscriptionService.removeSubscription(cryptoId);
    loadSubscriptions();
    onSubscriptionChange?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>My Subscriptions</span>
            <Badge variant="secondary">{subscriptions.length}</Badge>
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Add Crypto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Cryptocurrency</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Input
                  placeholder="Search for cryptocurrency..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                
                <ScrollArea className="h-[300px]">
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Searching...</span>
                    </div>
                  )}
                  
                  {!loading && searchResults.length === 0 && searchQuery && (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">No cryptocurrencies found</p>
                    </div>
                  )}
                  
                  {!loading && searchQuery === '' && (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Start typing to search...</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {searchResults.map((coin) => {
                      const isAlreadySubscribed = subscriptions.some(sub => sub.id === coin.id);
                      
                      return (
                        <div
                          key={coin.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={coin.large || coin.thumb || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6504bdc0-41f6-4c07-8d09-a07829b11ad4.png 2).toUpperCase() || 'C'}+Logo`}
                              alt={coin.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7b87c672-ea57-49ce-b62c-a5b4c9f03600.png 2).toUpperCase() || 'C'}`;
                              }}
                            />
                            <div>
                              <h4 className="font-semibold">{coin.name}</h4>
                              <p className="text-sm text-muted-foreground uppercase">
                                {coin.symbol}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleAddSubscription(coin)}
                            disabled={isAlreadySubscribed}
                            variant={isAlreadySubscribed ? "secondary" : "default"}
                          >
                            {isAlreadySubscribed ? 'Added' : 'Add'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4 opacity-50">
              📊
            </div>
            <p className="text-muted-foreground mb-4">No subscriptions yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add cryptocurrencies to your watchlist to receive notifications and track their performance.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={subscription.image}
                      alt={subscription.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/256c817a-2657-4e55-b9e8-e11c73e41aa7.png 2).toUpperCase()}`;
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{subscription.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {subscription.symbol.toUpperCase()} • Added {formatDate(subscription.addedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {subscription.priceThreshold && (
                      <Badge variant="outline" className="text-xs">
                        Alert: {subscription.priceThreshold}%
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveSubscription(subscription.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {subscriptions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total subscriptions: {subscriptions.length}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  subscriptionService.clearAllSubscriptions();
                  loadSubscriptions();
                  onSubscriptionChange?.();
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}