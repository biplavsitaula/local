"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Plus } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { seasonalThemesService, SeasonalThemeApiResponse } from '@/services/seasonal-themes.service';
import { AddThemeModal } from '@/components/features/admin/settings/AddThemeModal';
import { toast } from 'sonner';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Trash2 } from 'lucide-react';
import { SuccessMsgModal } from '@/components/SuccessMsgModal';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    storeName: 'Flame Beverage',
    contactEmail: 'admin@flamebeverage.com',
  });

  const [themes, setThemes] = useState([
    { label: "Default", value: "default" },
  ]);
  
  const [theme, setTheme] = useState("default");
  const [addThemeModalOpen, setAddThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<SeasonalThemeApiResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { canEdit } = useRoleAccess();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
    useEffect(() => {
      if (theme === "default") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    }, [theme]);

  // Fetch settings and themes on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [settingsResponse, themesResponse, categoriesResponse] = await Promise.all([
          settingsService.get(),
          seasonalThemesService.getAll(),
          settingsService.getCategories().catch(() => ({ success: true, data: [] })),
        ]);
        
        if (settingsResponse.success && settingsResponse.data) {
          const settings = settingsResponse.data;
          
          // Update notifications
          if (settings.notifications) {
            setNotifications({
              lowStockAlerts: settings.notifications.lowStockAlerts ?? true,
              outOfStockAlerts: settings.notifications.outOfStockAlerts ?? true,
              newReviewNotifications: settings.notifications.newReviewNotifications ?? false,
            });
          }
          
          // Update stock thresholds
          if (settings.stockThresholds) {
            setStockThresholds({
              lowStock: String(settings.stockThresholds.lowStock ?? 10),
              criticalStock: String(settings.stockThresholds.criticalStock ?? 5),
            });
          }
          
          // Update store info
          if (settings.storeInfo) {
            setStoreInfo({
              storeName: settings.storeInfo.storeName || 'Flame Beverage',
              contactEmail: settings.storeInfo.contactEmail || 'admin@flamebeverage.com',
            });
          }

          // Update theme
          if (settings.theme) {
            setTheme(settings.theme);
          }
        }

        // Update themes list
        if (themesResponse.success && themesResponse.data) {
          // Filter out any API themes with "default" keyname to avoid duplicates
          const apiThemes = Array.isArray(themesResponse.data) 
            ? themesResponse.data
                .filter((t: SeasonalThemeApiResponse) => (t.keyname || '').toLowerCase() !== 'default')
                .map((t: SeasonalThemeApiResponse) => ({
                  label: `${t.emoji || ''} ${t.title || t.keyname}`,
                  value: t.keyname || '',
                }))
            : [];
          
          const themesList = [
            { label: "Default", value: "default" },
            ...apiThemes,
          ];
          setThemes(themesList);
        }

        // Update categories list
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings. Using default values.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setLoadingCategories(true);
      const response = await settingsService.addCategory(newCategory.trim());
      if (response.success) {
        setCategories(response.data || []);
        setNewCategory("");
        toast.success('Category added successfully');
      } else {
        toast.error(response.message || 'Failed to add category');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.response?.message || 
                          error?.message || 
                          'Failed to add category. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Are you sure you want to delete the category "${category}"?`)) {
      return;
    }
    
    try {
      setLoadingCategories(true);
      const response = await settingsService.deleteCategory(category);
      if (response.success) {
        setCategories(prev => prev.filter(c => c !== category));
        toast.success('Category deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.response?.message || 
                          error?.message || 
                          'Failed to delete category. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const settingsData = {
        notifications: {
          lowStockAlerts: notifications.lowStockAlerts,
          outOfStockAlerts: notifications.outOfStockAlerts,
          newReviewNotifications: notifications.newReviewNotifications,
        },
        stockThresholds: {
          lowStock: parseInt(stockThresholds.lowStock, 10),
          criticalStock: parseInt(stockThresholds.criticalStock, 10),
        },
        storeInfo: {
          storeName: storeInfo.storeName,
          contactEmail: storeInfo.contactEmail,
        },
        theme: theme,
      };

      const response = await settingsService.update(settingsData);
      
      if (response.success) {
        // Use API response message directly - it exists based on console log
        const message = response.message?.trim() || 'Settings saved successfully!';
        // Show success modal instead of toast
        setSuccessMessage(message || 'Settings saved successfully!');
        setSuccessModalOpen(true);
      } else {
        // Show API error message
        const errorMessage = response.message?.trim() || 'Failed to save settings';
        toast.error(String(errorMessage));
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      // Extract API response message if available
      // Try multiple possible error structures
      const apiMessage = error?.response?.data?.message || 
                        error?.response?.data?.error ||
                        error?.response?.message || 
                        error?.message || 
                        error?.toString() ||
                        'Failed to save settings. Please try again.';
      toast.error(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

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
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-foreground">Select Theme</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTheme(null);
                setAddThemeModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Theme
            </Button>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-background"
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
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

      {/* Category Management Section */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-6">Product Categories</h2>
        
        <div className="space-y-6">
          {/* Add Category Input - Always visible, disabled if not super admin */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="newCategory" className="text-base font-medium text-foreground">
                Add New Category
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="newCategory"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Cold Drinks, Juices"
                className="flex-1 bg-background border-border"
                // disabled={!canEdit || loadingCategories}
                disabled={loadingCategories}
                onKeyPress={(e) => {
                  if (e.key === 'Enter'  && newCategory.trim()) {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <Button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || loadingCategories}
                className="gap-2"
              >
                {loadingCategories ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
            {!canEdit && (
              <p className="text-xs text-muted-foreground">
                Only super admin can add new categories
              </p>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">
              Existing Categories ({categories.length})
            </Label>
            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-flame-orange" />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
                  >
                    <span className="text-sm font-medium text-foreground capitalize">{category}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        disabled={loadingCategories}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No categories found. Add your first category above.</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-flame-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Add Theme Modal */}
      <AddThemeModal
        open={addThemeModalOpen}
        onOpenChange={setAddThemeModalOpen}
        theme={selectedTheme}
        onSuccess={async () => {
          // Refresh themes list
          try {
            const themesResponse = await seasonalThemesService.getAll();
            if (themesResponse.success && themesResponse.data) {
              // Filter out any API themes with "default" keyname to avoid duplicates
              const apiThemes = Array.isArray(themesResponse.data) 
                ? themesResponse.data
                    .filter((t: SeasonalThemeApiResponse) => (t.keyname || '').toLowerCase() !== 'default')
                    .map((t: SeasonalThemeApiResponse) => ({
                      label: `${t.emoji || ''} ${t.title || t.keyname}`,
                      value: t.keyname || '',
                    }))
                : [];
              
              const themesList = [
                { label: "Default", value: "default" },
                ...apiThemes,
              ];
              setThemes(themesList);
            }
          } catch (error) {
            console.error('Error refreshing themes:', error);
          }
        }}
      />

      {/* Success Modal */}
      <SuccessMsgModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        message={successMessage}
        title="Success"
      />
    </div>
  );
}
