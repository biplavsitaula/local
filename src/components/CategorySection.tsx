"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Wine, Beer, GlassWater, Martini, Grape, Cherry } from 'lucide-react';
import { ICategorySectionProps } from '@/interface/ICategorySectionProps';

const CategorySection: React.FC<ICategorySectionProps> = ({ selected, onSelect }) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Main 4 categories matching the design
  const mainCategories = [
    { id: 'whisky', name: 'Whisky', nameNe: 'व्हिस्की', icon: Wine, color: 'from-amber-500 to-amber-700' },
    { id: 'vodka', name: 'Vodka', nameNe: 'भोड्का', icon: GlassWater, color: 'from-blue-400 to-blue-600' },
    { id: 'rum', name: 'Rum', nameNe: 'रम', icon: Cherry, color: 'from-red-500 to-red-700' },
    { id: 'beer', name: 'Beer', nameNe: 'बियर', icon: Beer, color: 'from-yellow-500 to-yellow-700' },
  ];

  // Use default theme during SSR to prevent hydration mismatch
  const currentTheme = mounted ? theme : 'dark';

  return (
    <section className={`py-12 transition-colors ${
      currentTheme === 'dark' ? 'bg-secondary/20' : 'bg-gray-50/50'
    }`}>
      <div className="container mx-auto px-4">
        <h2 className={`mb-8 text-center font-display text-3xl font-bold ${
          currentTheme === 'dark' ? 'text-foreground' : 'text-gray-900'
        }`}>
          {t('categories')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mainCategories.map((category) => {
            const isSelected = selected === category.name;
            const Icon = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelect(selected === category.name ? '' : category.name)}
                className={`group flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 ${
                  isSelected
                    ? `border-flame-orange bg-gradient-to-br ${category.color} shadow-lg shadow-flame-orange/20`
                    : currentTheme === 'dark'
                    ? 'border-border bg-card hover:border-flame-orange/50 hover:shadow-md'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <Icon className={`text-3xl transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-white' : currentTheme === 'dark' ? 'text-flame-orange' : 'text-orange-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isSelected
                    ? 'text-white'
                    : currentTheme === 'dark'
                    ? 'text-foreground'
                    : 'text-gray-900'
                }`}>
                  {language === 'en' ? category.name : category.nameNe}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
