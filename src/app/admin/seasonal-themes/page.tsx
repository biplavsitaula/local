"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Edit, Palette, ArrowLeft } from 'lucide-react';
import { seasonalThemesService, SeasonalThemeApiResponse } from '@/services/seasonal-themes.service';
import { settingsService } from '@/services/settings.service';
import { AddThemeModal } from '@/components/features/admin/settings/AddThemeModal';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SeasonalThemesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allThemesData, setAllThemesData] = useState<SeasonalThemeApiResponse[]>([]);
  const [themes, setThemes] = useState([
    { label: "None (Hide Seasonal Section)", value: "none" },
    { label: "Default", value: "default" },
  ]);
  const [selectedActiveTheme, setSelectedActiveTheme] = useState("default");
  const [addThemeModalOpen, setAddThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<SeasonalThemeApiResponse | null>(null);
  const [deletingTheme, setDeletingTheme] = useState<string | null>(null);

  // Apply theme to document
  useEffect(() => {
    if (selectedActiveTheme === "default" || selectedActiveTheme === "none") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", selectedActiveTheme);
    }
  }, [selectedActiveTheme]);

  // Fetch themes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [themesResponse, settingsResponse] = await Promise.all([
          seasonalThemesService.getAll(),
          settingsService.get(),
        ]);

        // Update themes list
        if (themesResponse.success && themesResponse.data) {
          const fullThemesData = Array.isArray(themesResponse.data) 
            ? themesResponse.data.filter((t: SeasonalThemeApiResponse) => (t.keyname || '').toLowerCase() !== 'default')
            : [];
          setAllThemesData(fullThemesData);
          
          const apiThemes = fullThemesData.map((t: SeasonalThemeApiResponse) => ({
            label: `${t.emoji || ''} ${t.title || t.keyname}`,
            value: t.keyname || '',
          }));
          
          const themesList = [
            { label: "None (Hide Seasonal Section)", value: "none" },
            { label: "Default", value: "default" },
            ...apiThemes,
          ];
          setThemes(themesList);
        }

        // Get current active theme from settings
        if (settingsResponse.success && settingsResponse.data?.theme) {
          setSelectedActiveTheme(settingsResponse.data.theme);
        }
      } catch (error: any) {
        console.error('Error fetching themes:', error);
        toast.error('Failed to load themes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditTheme = (themeData: SeasonalThemeApiResponse) => {
    setSelectedTheme(themeData);
    setAddThemeModalOpen(true);
  };

  const handleDeleteTheme = async (keyname: string) => {
    if (!confirm(`Are you sure you want to delete the theme "${keyname}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeletingTheme(keyname);
      const response = await seasonalThemesService.delete(keyname);
      
      if (response.success) {
        // If the deleted theme was currently selected, reset to default
        if (selectedActiveTheme === keyname) {
          setSelectedActiveTheme("default");
          // Also update in settings
          await settingsService.update({ theme: "default" });
        }
        
        await refreshThemesList();
        toast.success('Theme deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete theme');
      }
    } catch (error: any) {
      console.error('Error deleting theme:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to delete theme. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDeletingTheme(null);
    }
  };

  const refreshThemesList = async () => {
    try {
      const themesResponse = await seasonalThemesService.getAll();
      if (themesResponse.success && themesResponse.data) {
        const fullThemesData = Array.isArray(themesResponse.data) 
          ? themesResponse.data.filter((t: SeasonalThemeApiResponse) => (t.keyname || '').toLowerCase() !== 'default')
          : [];
        setAllThemesData(fullThemesData);
        
        const apiThemes = fullThemesData.map((t: SeasonalThemeApiResponse) => ({
          label: `${t.emoji || ''} ${t.title || t.keyname}`,
          value: t.keyname || '',
        }));
        
        const themesList = [
          { label: "None (Hide Seasonal Section)", value: "none" },
          { label: "Default", value: "default" },
          ...apiThemes,
        ];
        setThemes(themesList);
      }
    } catch (error) {
      console.error('Error refreshing themes:', error);
    }
  };

  const handleSaveActiveTheme = async () => {
    try {
      setSaving(true);
      const response = await settingsService.update({ theme: selectedActiveTheme });
      
      if (response.success) {
        toast.success('Active theme updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update active theme');
      }
    } catch (error: any) {
      console.error('Error saving active theme:', error);
      toast.error('Failed to save active theme. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading seasonal themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/settings"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Palette className="h-8 w-8 text-flame-orange" />
              Seasonal Themes
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage seasonal themes for your store.</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            setSelectedTheme(null);
            setAddThemeModalOpen(true);
          }}
          className="gap-2 bg-flame-gradient text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Theme
        </Button>
      </div>

      {/* Active Theme Selection */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Theme</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select which theme to display on your storefront. Choose "None" to hide the seasonal section entirely.
        </p>
        
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-md space-y-2">
            <Label htmlFor="activeTheme" className="text-sm font-medium text-foreground">
              Select Active Theme
            </Label>
            <select
              id="activeTheme"
              value={selectedActiveTheme}
              onChange={(e) => setSelectedActiveTheme(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 bg-background"
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleSaveActiveTheme}
            disabled={saving}
            className="bg-flame-gradient text-primary-foreground hover:opacity-90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Apply Theme'
            )}
          </Button>
        </div>
      </div>

      {/* Themes List */}
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            All Themes ({allThemesData.length})
          </h2>
        </div>
        
        <div className="space-y-4">
          {allThemesData.length > 0 ? (
            <div className="grid gap-3">
              {allThemesData.map((themeItem) => (
                <div
                  key={themeItem.keyname}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    selectedActiveTheme === themeItem.keyname 
                      ? 'border-flame-orange bg-flame-orange/10' 
                      : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Emoji/Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center text-2xl">
                      {themeItem.emoji || '🎨'}
                    </div>
                    
                    {/* Theme Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">
                          {themeItem.title || themeItem.keyname}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                          {themeItem.keyname}
                        </span>
                        {themeItem.isActive && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500">
                            Active
                          </span>
                        )}
                        {selectedActiveTheme === themeItem.keyname && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-flame-orange/20 text-flame-orange">
                            Currently Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {themeItem.subtitle || themeItem.description}
                      </p>
                      {themeItem.tags && themeItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {themeItem.tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {themeItem.tags.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{themeItem.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                      {themeItem.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Category: <span className="text-foreground">{themeItem.category}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTheme(themeItem)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTheme(themeItem.keyname)}
                      disabled={deletingTheme === themeItem.keyname}
                      className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    >
                      {deletingTheme === themeItem.keyname ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Seasonal Themes Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first seasonal theme to showcase special promotions, holidays, or events on your storefront.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setSelectedTheme(null);
                  setAddThemeModalOpen(true);
                }}
                className="gap-2 bg-flame-gradient text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create Your First Theme
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Theme Modal */}
      <AddThemeModal
        open={addThemeModalOpen}
        onOpenChange={setAddThemeModalOpen}
        theme={selectedTheme}
        onSuccess={refreshThemesList}
      />
    </div>
  );
}






