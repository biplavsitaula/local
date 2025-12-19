"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    outOfStockAlerts: true,
    newReviewNotifications: false,
  });

  const [stockThresholds, setStockThresholds] = useState({
    lowStock: '10',
    criticalStock: '5',
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: 'LiquorHub Premium Spirits',
    contactEmail: 'admin@liquorhub.com',
  });

  const handleSave = () => {
    // Here you would typically save to backend/localStorage
    console.log('Saving settings:', { notifications, stockThresholds, storeInfo });
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin preferences.</p>
      </div>

      {/* Notifications Section */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-6">Notifications</h2>
        
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground mb-1 block">
                Low Stock Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when products are running low
              </p>
            </div>
            <Switch
              id="lowStockAlerts"
              checked={notifications.lowStockAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, lowStockAlerts: checked })
              }
              className="flex-shrink-0"
            />
          </div>

          {/* Out of Stock Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground mb-1 block">
                Out of Stock Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Immediate notification when stock runs out
              </p>
            </div>
            <Switch
              id="outOfStockAlerts"
              checked={notifications.outOfStockAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, outOfStockAlerts: checked })
              }
              className="flex-shrink-0"
            />
          </div>

          {/* New Review Notifications */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground mb-1 block">
                New Review Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new customer reviews
              </p>
            </div>
            <Switch
              id="newReviewNotifications"
              checked={notifications.newReviewNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, newReviewNotifications: checked })
              }
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Stock Thresholds Section */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-6">Stock Thresholds</h2>
        
        <div className="space-y-6">
          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold" className="text-base font-medium text-foreground">
              Low Stock Threshold
            </Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={stockThresholds.lowStock}
              onChange={(e) =>
                setStockThresholds({ ...stockThresholds, lowStock: e.target.value })
              }
              className="max-w-xs"
              min="0"
            />
          </div>

          {/* Critical Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="criticalStockThreshold" className="text-base font-medium text-foreground">
              Critical Stock Threshold
            </Label>
            <Input
              id="criticalStockThreshold"
              type="number"
              value={stockThresholds.criticalStock}
              onChange={(e) =>
                setStockThresholds({ ...stockThresholds, criticalStock: e.target.value })
              }
              className="max-w-xs"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Store Information Section */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-6">Store Information</h2>
        
        <div className="space-y-6">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="storeName" className="text-base font-medium text-foreground">
              Store Name
            </Label>
            <Input
              id="storeName"
              type="text"
              value={storeInfo.storeName}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, storeName: e.target.value })
              }
              className="max-w-md"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-base font-medium text-foreground">
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={storeInfo.contactEmail}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, contactEmail: e.target.value })
              }
              className="max-w-md"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-flame-gradient text-primary-foreground hover:opacity-90"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
