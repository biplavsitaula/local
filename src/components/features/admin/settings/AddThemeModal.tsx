"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { seasonalThemesService, SeasonalThemeApiResponse } from '@/services/seasonal-themes.service';
import { toast } from 'sonner';

interface AddThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  theme?: SeasonalThemeApiResponse | null;
}

export function AddThemeModal({ open, onOpenChange, onSuccess, theme }: AddThemeModalProps) {
  const isEditMode = !!theme;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyname: '',
    title: '',
    subtitle: '',
    description: '',
    tags: '',
    ctaText: '',
    category: 'All',
    emoji: '',
    colors: {
      primary: '',
      secondary: '',
      accent: '',
    },
    gradient: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (theme && open) {
      setFormData({
        keyname: theme.keyname || '',
        title: theme.title || '',
        subtitle: theme.subtitle || '',
        description: theme.description || '',
        tags: Array.isArray(theme.tags) ? theme.tags.join(', ') : '',
        ctaText: theme.ctaText || '',
        category: theme.category || 'All',
        emoji: theme.emoji || '',
        colors: {
          primary: theme.colors?.primary || '',
          secondary: theme.colors?.secondary || '',
          accent: theme.colors?.accent || '',
        },
        gradient: theme.gradient || '',
        isActive: theme.isActive ?? true,
      });
    } else if (!theme && open) {
      setFormData({
        keyname: '',
        title: '',
        subtitle: '',
        description: '',
        tags: '',
        ctaText: '',
        category: 'All',
        emoji: '',
        colors: {
          primary: '',
          secondary: '',
          accent: '',
        },
        gradient: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [theme, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.keyname.trim()) {
      newErrors.keyname = 'Keyname is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Subtitle is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.ctaText.trim()) {
      newErrors.ctaText = 'CTA Text is required';
    }

    if (!formData.colors.primary.trim()) {
      newErrors.primaryColor = 'Primary color is required';
    }

    if (!formData.colors.secondary.trim()) {
      newErrors.secondaryColor = 'Secondary color is required';
    }

    if (!formData.colors.accent.trim()) {
      newErrors.accentColor = 'Accent color is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const themeData: Partial<SeasonalThemeApiResponse> = {
        keyname: formData.keyname as any,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        ctaText: formData.ctaText,
        category: formData.category,
        emoji: formData.emoji || undefined,
        colors: {
          primary: formData.colors.primary,
          secondary: formData.colors.secondary,
          accent: formData.colors.accent,
        },
        gradient: formData.gradient || undefined,
        isActive: formData.isActive,
      };

      let response;
      if (isEditMode && theme?.keyname) {
        response = await seasonalThemesService.update(theme.keyname, themeData);
      } else {
        response = await seasonalThemesService.create(themeData);
      }

      if (response.success) {
        toast.success(isEditMode ? 'Theme updated successfully!' : 'Theme created successfully!');
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to save theme');
      }
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast.error(error.message || 'Failed to save theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-flame-orange">
            {isEditMode ? 'Edit Theme' : 'Add New Theme'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Keyname */}
          <div className="space-y-2">
            <Label htmlFor="keyname" className="text-sm font-medium text-foreground">
              Keyname <span className="text-destructive">*</span>
            </Label>
            <Input
              id="keyname"
              value={formData.keyname}
              onChange={(e) => setFormData({ ...formData, keyname: e.target.value })}
              placeholder="e.g., tihar, dashain, christmas"
              disabled={isEditMode}
              className={errors.keyname ? 'border-destructive' : ''}
            />
            {errors.keyname && (
              <p className="text-xs text-destructive">{errors.keyname}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tihar Lights"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-sm font-medium text-foreground">
              Subtitle <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g., Seasonal spotlight"
              className={errors.subtitle ? 'border-destructive' : ''}
            />
            {errors.subtitle && (
              <p className="text-xs text-destructive">{errors.subtitle}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Theme description..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-foreground">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., 🪔 Diya collection, ✨ Light up, 🎁 Gift ready"
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>

          {/* CTA Text */}
          <div className="space-y-2">
            <Label htmlFor="ctaText" className="text-sm font-medium text-foreground">
              CTA Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              placeholder="e.g., Explore Tihar picks"
              className={errors.ctaText ? 'border-destructive' : ''}
            />
            {errors.ctaText && (
              <p className="text-xs text-destructive">{errors.ctaText}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., All"
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label htmlFor="emoji" className="text-sm font-medium text-foreground">
              Emoji
            </Label>
            <Input
              id="emoji"
              value={formData.emoji}
              onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              placeholder="e.g., 🪔"
              maxLength={2}
            />
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Colors <span className="text-destructive">*</span></Label>
            
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-xs text-muted-foreground">
                Primary Color
              </Label>
              <Input
                id="primaryColor"
                value={formData.colors.primary}
                onChange={(e) => setFormData({
                  ...formData,
                  colors: { ...formData.colors, primary: e.target.value }
                })}
                placeholder="e.g., from-amber-400/30 to-orange-400/20"
                className={errors.primaryColor ? 'border-destructive' : ''}
              />
              {errors.primaryColor && (
                <p className="text-xs text-destructive">{errors.primaryColor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor" className="text-xs text-muted-foreground">
                Secondary Color
              </Label>
              <Input
                id="secondaryColor"
                value={formData.colors.secondary}
                onChange={(e) => setFormData({
                  ...formData,
                  colors: { ...formData.colors, secondary: e.target.value }
                })}
                placeholder="e.g., from-yellow-300/30 to-amber-300/20"
                className={errors.secondaryColor ? 'border-destructive' : ''}
              />
              {errors.secondaryColor && (
                <p className="text-xs text-destructive">{errors.secondaryColor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor" className="text-xs text-muted-foreground">
                Accent Color
              </Label>
              <Input
                id="accentColor"
                value={formData.colors.accent}
                onChange={(e) => setFormData({
                  ...formData,
                  colors: { ...formData.colors, accent: e.target.value }
                })}
                placeholder="e.g., border-amber-400/30"
                className={errors.accentColor ? 'border-destructive' : ''}
              />
              {errors.accentColor && (
                <p className="text-xs text-destructive">{errors.accentColor}</p>
              )}
            </div>
          </div>

          {/* Gradient */}
          <div className="space-y-2">
            <Label htmlFor="gradient" className="text-sm font-medium text-foreground">
              Gradient (optional)
            </Label>
            <Textarea
              id="gradient"
              value={formData.gradient}
              onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
              placeholder="e.g., bg-[radial-gradient(...)]"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-flame-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Theme' : 'Create Theme'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



