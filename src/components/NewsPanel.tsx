'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { newsAPI, type CryptoNews, type NewsResponse } from '@/lib/newsApi';
import { subscriptionService } from '@/lib/subscriptionService';
import { formatDistanceToNow } from 'date-fns';

interface NewsPanelProps {
  className?: string;
}

export function NewsPanel({ className }: NewsPanelProps) {
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);

  const categories = ['all', ...newsAPI.getNewsCategories()];

  const loadNews = async () => {
    setLoading(true);
    setError(null);

    try {
      let newsResponse: NewsResponse;
      
      if (showSubscribedOnly) {
        const subscribedIds = subscriptionService.getSubscribedIds();
        newsResponse = await newsAPI.getNewsForCoins(subscribedIds);
      } else if (selectedCategory === 'all') {
        newsResponse = await newsAPI.getLatestNews(1, 20);
      } else {
        newsResponse = await newsAPI.getLatestNews(1, 20, selectedCategory);
      }

      setNews(newsResponse.articles);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [selectedCategory, showSubscribedOnly]);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      market: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      defi: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      regulation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      nft: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      gaming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cbdc: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Crypto News</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSubscribedOnly(!showSubscribedOnly)}
            className={showSubscribedOnly ? 'bg-primary text-primary-foreground' : ''}
          >
            {showSubscribedOnly ? 'All News' : 'My Coins'}
          </Button>
        </CardTitle>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading news...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-500 mb-2">⚠️ {error}</p>
                <Button onClick={loadNews} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No news articles found</p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <div className="space-y-0">
              {news.map((article, index) => (
                <div key={index}>
                  <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex space-x-4">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a7438344-3e8b-4f43-bf2e-da2a31c95316.png + 1}`;
                          }}
                        />
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                            {article.title}
                          </h3>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {article.source}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {article.category && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCategoryColor(article.category)}`}
                              >
                                {article.category}
                              </Badge>
                            )}
                            {article.sentiment && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getSentimentColor(article.sentiment)}`}
                              >
                                {article.sentiment}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < news.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}