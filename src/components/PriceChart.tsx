'use client';

import { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cryptoAPI, type CryptoPriceHistory } from '@/lib/cryptoApi';
import { format } from 'date-fns';

interface PriceChartProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice: number;
  priceChange24h: number;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  date: string;
  volume: number;
}

const timeRanges = [
  { label: '24H', days: 1, format: 'HH:mm' },
  { label: '7D', days: 7, format: 'MMM dd' },
  { label: '30D', days: 30, format: 'MMM dd' },
  { label: '90D', days: 90, format: 'MMM dd' },
  { label: '1Y', days: 365, format: 'MMM yyyy' },
];

export function PriceChart({ 
  coinId, 
  coinName, 
  coinSymbol, 
  currentPrice, 
  priceChange24h 
}: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState(timeRanges[1]); // Default to 7D
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async (days: number) => {
    setLoading(true);
    setError(null);

    try {
      const data: CryptoPriceHistory = await cryptoAPI.getPriceHistory(coinId, days);
      
      const formattedData: ChartDataPoint[] = data.prices.map((price, index) => ({
        timestamp: price[0],
        price: price[1],
        date: format(new Date(price[0]), selectedRange.format),
        volume: data.total_volumes[index]?.[1] || 0,
      }));

      setChartData(formattedData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedRange.days);
  }, [coinId, selectedRange]);

  const handleRangeChange = (range: typeof timeRanges[0]) => {
    setSelectedRange(range);
  };

  const formatPrice = (value: number) => {
    if (value >= 1) {
      return value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    }
  };

  const isPositiveChange = priceChange24h >= 0;
  const chartColor = isPositiveChange ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${coinId}`;

  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{coinName} ({coinSymbol.toUpperCase()})</span>
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <div 
                  key={range.label} 
                  className="px-3 py-1 rounded bg-muted animate-pulse h-8 w-12"
                />
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>{coinName} ({coinSymbol.toUpperCase()})</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">⚠️ {error}</p>
            <Button onClick={() => fetchChartData(selectedRange.days)} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{coinName}</span>
              <Badge variant="secondary">{coinSymbol.toUpperCase()}</Badge>
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-bold">{formatPrice(currentPrice)}</span>
              <Badge 
                variant={isPositiveChange ? "default" : "destructive"}
                className={isPositiveChange ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isPositiveChange ? '+' : ''}{priceChange24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={selectedRange.label === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange(range)}
                className="px-3 py-1 h-8"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `$${(value / 1000).toFixed(1)}k`;
                  } else if (value >= 1) {
                    return `$${value.toFixed(0)}`;
                  } else {
                    return `$${value.toFixed(4)}`;
                  }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}