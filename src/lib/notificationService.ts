'use client';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window;
      this.permission = this.isSupported ? Notification.permission : 'denied';
    }
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  // Send a notification
  async sendNotification(data: NotificationData): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: false,
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (data.data?.url) {
          window.open(data.data.url, '_blank');
        }
        
        notification.close();
      };

      // Auto-close after 10 seconds if not requiring interaction
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send price alert notification
  async sendPriceAlert(crypto: {
    name: string;
    symbol: string;
    price: number;
    change: number;
    image?: string;
  }): Promise<boolean> {
    const changeText = crypto.change >= 0 ? '+' + crypto.change.toFixed(2) : crypto.change.toFixed(2);
    const emoji = crypto.change >= 0 ? '🚀' : '📉';
    
    return this.sendNotification({
      title: `${emoji} ${crypto.name} Price Alert`,
      body: `${crypto.symbol.toUpperCase()} is now $${crypto.price.toFixed(4)} (${changeText}%)`,
      icon: crypto.image,
      tag: `price-${crypto.symbol}`,
      data: {
        type: 'price_alert',
        symbol: crypto.symbol,
        price: crypto.price,
        change: crypto.change,
      },
    });
  }

  // Send trending alert notification
  async sendTrendingAlert(crypto: {
    name: string;
    symbol: string;
    rank?: number;
    image?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      title: `📈 ${crypto.name} is Trending!`,
      body: `${crypto.symbol.toUpperCase()} is currently trending${crypto.rank ? ` (#${crypto.rank})` : ''}`,
      icon: crypto.image,
      tag: `trending-${crypto.symbol}`,
      requireInteraction: true,
      data: {
        type: 'trending_alert',
        symbol: crypto.symbol,
        rank: crypto.rank,
      },
    });
  }

  // Send news alert notification
  async sendNewsAlert(news: {
    title: string;
    summary?: string;
    url?: string;
    source?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      title: `📰 Crypto News Alert`,
      body: news.title,
      tag: 'crypto-news',
      requireInteraction: true,
      data: {
        type: 'news_alert',
        url: news.url,
        source: news.source,
      },
    });
  }

  // Send volume spike alert
  async sendVolumeAlert(crypto: {
    name: string;
    symbol: string;
    volumeIncrease: number;
    image?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      title: `📊 Volume Spike Alert`,
      body: `${crypto.name} (${crypto.symbol.toUpperCase()}) volume increased by ${crypto.volumeIncrease.toFixed(1)}%`,
      icon: crypto.image,
      tag: `volume-${crypto.symbol}`,
      data: {
        type: 'volume_alert',
        symbol: crypto.symbol,
        volumeIncrease: crypto.volumeIncrease,
      },
    });
  }

  // Check if notifications are enabled and permission granted
  areNotificationsEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Get notification status info
  getStatus(): {
    supported: boolean;
    permission: NotificationPermission;
    enabled: boolean;
  } {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.areNotificationsEnabled(),
    };
  }

  // Test notification
  async sendTestNotification(): Promise<boolean> {
    return this.sendNotification({
      title: '🔔 Test Notification',
      body: 'Crypto notifications are working correctly!',
      tag: 'test-notification',
    });
  }
}

export const notificationService = new NotificationService();