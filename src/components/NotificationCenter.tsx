'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationCenter() {
  const {
    isSupported,
    permission,
    settings,
    requestPermission,
    updateSettings,
    sendTestNotification,
  } = useNotifications();

  const [testLoading, setTestLoading] = useState(false);

  const handlePermissionRequest = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // Show success message or update UI
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    await sendTestNotification();
    setTimeout(() => setTestLoading(false), 1000);
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'denied':
        return { text: 'Denied', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      default:
        return { text: 'Not Set', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4 opacity-50 text-4xl">🚫</div>
            <p className="text-muted-foreground mb-4">Notifications Not Supported</p>
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support web notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notification Center</span>
          <Badge className={permissionStatus.color}>
            {permissionStatus.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Browser Permissions</h4>
              <p className="text-sm text-muted-foreground">
                Allow notifications to receive crypto alerts
              </p>
            </div>
            {permission !== 'granted' && (
              <Button onClick={handlePermissionRequest} size="sm">
                Enable Notifications
              </Button>
            )}
            {permission === 'granted' && (
              <Button 
                onClick={handleTestNotification} 
                size="sm" 
                variant="outline"
                disabled={testLoading}
              >
                {testLoading ? 'Sending...' : 'Test'}
              </Button>
            )}
          </div>
          
          {permission === 'denied' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Notifications are blocked. Please enable them in your browser settings and refresh the page.
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Enable Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Turn on notifications for your subscribed cryptocurrencies
              </p>
            </div>
            <Switch
              checked={settings.enabled && permission === 'granted'}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
              disabled={permission !== 'granted'}
            />
          </div>

          {settings.enabled && permission === 'granted' && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Price Change Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Price Change Alerts</label>
                  <span className="text-sm text-muted-foreground">
                    {settings.priceChangeThreshold}%
                  </span>
                </div>
                <Slider
                  value={[settings.priceChangeThreshold]}
                  onValueChange={(value) => updateSettings({ priceChangeThreshold: value[0] })}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when subscribed coins change by this percentage
                </p>
              </div>

              {/* Volume Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Volume Spike Alerts</label>
                  <span className="text-sm text-muted-foreground">
                    {settings.volumeThreshold}%
                  </span>
                </div>
                <Slider
                  value={[settings.volumeThreshold]}
                  onValueChange={(value) => updateSettings({ volumeThreshold: value[0] })}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when volume increases by this percentage
                </p>
              </div>

              {/* Trending Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Trending Alerts</label>
                  <p className="text-xs text-muted-foreground">
                    Notify when subscribed coins are trending
                  </p>
                </div>
                <Switch
                  checked={settings.trendingAlerts}
                  onCheckedChange={(checked) => updateSettings({ trendingAlerts: checked })}
                />
              </div>

              {/* News Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">News Alerts</label>
                  <p className="text-xs text-muted-foreground">
                    Notify about important crypto news
                  </p>
                </div>
                <Switch
                  checked={settings.newsAlerts}
                  onCheckedChange={(checked) => updateSettings({ newsAlerts: checked })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h5 className="font-medium mb-2">Notification Status</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Browser Support:</span>
              <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
                {isSupported ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Permission:</span>
              <span className={permission === 'granted' ? 'text-green-600' : 'text-yellow-600'}>
                {permission}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Notifications:</span>
              <span className={settings.enabled && permission === 'granted' ? 'text-green-600' : 'text-gray-600'}>
                {settings.enabled && permission === 'granted' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">💡 <strong>Tip:</strong> Keep this tab open in the background to receive notifications.</p>
          <p>🔧 If notifications aren't working, check your browser's notification settings for this site.</p>
        </div>
      </CardContent>
    </Card>
  );
}