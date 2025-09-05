'use client';

export interface Subscription {
  id: string;
  symbol: string;
  name: string;
  image: string;
  priceThreshold?: number;
  notifyOnTrends?: boolean;
  addedAt: string;
}

const STORAGE_KEY = 'crypto_subscriptions';
const SETTINGS_KEY = 'crypto_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  priceChangeThreshold: number;
  volumeThreshold: number;
  trendingAlerts: boolean;
  newsAlerts: boolean;
}

class SubscriptionService {
  private defaultSettings: NotificationSettings = {
    enabled: false,
    priceChangeThreshold: 5, // 5% change
    volumeThreshold: 50, // 50% volume increase
    trendingAlerts: true,
    newsAlerts: true,
  };

  // Get all subscriptions
  getSubscriptions(): Subscription[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      return [];
    }
  }

  // Add a subscription
  addSubscription(crypto: {
    id: string;
    symbol: string;
    name: string;
    image: string;
  }): void {
    if (typeof window === 'undefined') return;

    const subscriptions = this.getSubscriptions();
    const exists = subscriptions.find(sub => sub.id === crypto.id);
    
    if (!exists) {
      const newSubscription: Subscription = {
        ...crypto,
        priceThreshold: 5,
        notifyOnTrends: true,
        addedAt: new Date().toISOString(),
      };
      
      subscriptions.push(newSubscription);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }

  // Remove a subscription
  removeSubscription(cryptoId: string): void {
    if (typeof window === 'undefined') return;

    const subscriptions = this.getSubscriptions();
    const filtered = subscriptions.filter(sub => sub.id !== cryptoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  // Check if a crypto is subscribed
  isSubscribed(cryptoId: string): boolean {
    const subscriptions = this.getSubscriptions();
    return subscriptions.some(sub => sub.id === cryptoId);
  }

  // Update subscription settings
  updateSubscription(cryptoId: string, updates: Partial<Subscription>): void {
    if (typeof window === 'undefined') return;

    const subscriptions = this.getSubscriptions();
    const index = subscriptions.findIndex(sub => sub.id === cryptoId);
    
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }

  // Get notification settings
  getNotificationSettings(): NotificationSettings {
    if (typeof window === 'undefined') return this.defaultSettings;

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.defaultSettings;
    }
  }

  // Update notification settings
  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    if (typeof window === 'undefined') return;

    const current = this.getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }

  // Get subscribed crypto IDs
  getSubscribedIds(): string[] {
    return this.getSubscriptions().map(sub => sub.id);
  }

  // Clear all subscriptions
  clearAllSubscriptions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Export subscriptions
  exportSubscriptions(): string {
    const subscriptions = this.getSubscriptions();
    const settings = this.getNotificationSettings();
    return JSON.stringify({ subscriptions, settings }, null, 2);
  }

  // Import subscriptions
  importSubscriptions(data: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const parsed = JSON.parse(data);
      if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.subscriptions));
        if (parsed.settings) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing subscriptions:', error);
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();