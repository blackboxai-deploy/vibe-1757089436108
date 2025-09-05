'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/notificationService';
import { subscriptionService, type NotificationSettings } from '@/lib/subscriptionService';
import type { CryptoAsset } from '@/lib/cryptoApi';

export interface UseNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission;
  settings: NotificationSettings;
  requestPermission: () => Promise<NotificationPermission>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  sendTestNotification: () => Promise<boolean>;
  checkPriceAlerts: (assets: CryptoAsset[]) => Promise<void>;
}

interface PriceMemory {
  [cryptoId: string]: {
    price: number;
    timestamp: number;
    notificationSent: boolean;
  };
}

export function useNotifications(): UseNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    priceChangeThreshold: 5,
    volumeThreshold: 50,
    trendingAlerts: true,
    newsAlerts: true,
  });
  const [priceMemory] = useState<PriceMemory>({});

  // Initialize notification settings
  useEffect(() => {
    setPermission(notificationService.getPermission());
    setSettings(subscriptionService.getNotificationSettings());
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      // Update settings to enable notifications if permission granted
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      subscriptionService.updateNotificationSettings(newSettings);
    }
    
    return result;
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    subscriptionService.updateNotificationSettings(updated);
  }, [settings]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    return await notificationService.sendTestNotification();
  }, []);

  const checkPriceAlerts = useCallback(async (assets: CryptoAsset[]) => {
    if (!settings.enabled || permission !== 'granted') return;

    const subscriptions = subscriptionService.getSubscriptions();
    const currentTime = Date.now();
    const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes cooldown between same-type notifications

    for (const asset of assets) {
      const subscription = subscriptions.find(sub => sub.id === asset.id);
      if (!subscription) continue;

      const currentPrice = asset.current_price;
      const priceChange24h = asset.price_change_percentage_24h || 0;
      
      // Store previous price for comparison
      const previousData = priceMemory[asset.id];
      if (previousData) {
        const timeSinceLastCheck = currentTime - previousData.timestamp;
        const priceChangeThreshold = subscription.priceThreshold || settings.priceChangeThreshold;

        // Check if price change exceeds threshold
        if (Math.abs(priceChange24h) >= priceChangeThreshold) {
          // Only send notification if cooldown period has passed
          if (!previousData.notificationSent || timeSinceLastCheck > COOLDOWN_PERIOD) {
            await notificationService.sendPriceAlert({
              name: asset.name,
              symbol: asset.symbol,
              price: currentPrice,
              change: priceChange24h,
              image: asset.image,
            });

            priceMemory[asset.id].notificationSent = true;
          }
        } else {
          // Reset notification sent flag if price is back within threshold
          priceMemory[asset.id].notificationSent = false;
        }
      }

      // Update price memory
      priceMemory[asset.id] = {
        price: currentPrice,
        timestamp: currentTime,
        notificationSent: priceMemory[asset.id]?.notificationSent || false,
      };
    }
  }, [settings, permission, priceMemory]);

  return {
    isSupported: notificationService.isNotificationSupported(),
    permission,
    settings,
    requestPermission,
    updateSettings,
    sendTestNotification,
    checkPriceAlerts,
  };
}