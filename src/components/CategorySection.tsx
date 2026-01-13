"use client";


import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, LayoutGrid, Sparkles, Coffee, FlameKindling, ChevronDown } from 'lucide-react';
import { ICategorySectionProps } from '@/interface/ICategorySectionProps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const CategorySection: React.FC<ICategorySectionProps> = ({ selected, onSelect }) => {
 const { language, t } = useLanguage();
 const { theme } = useTheme();
 const [mounted, setMounted] = useState(false);


 // Prevent hydration mismatch by only rendering after mount
 useEffect(() => {
   setMounted(true);
 }, []);


 // Categories matching the API response
 const categories = [
   { id: 'all', name: 'All', nameNe: 'सबै', icon: LayoutGrid, color: 'from-flame-orange to-flame-red' },
   { id: 'whiskey', name: 'Whiskey', nameNe: 'व्हिस्की', icon: Wine, color: 'from-amber-500 to-amber-700' },
   { id: 'vodka', name: 'Vodka', nameNe: 'भोड्का', icon: GlassWater, color: 'from-blue-400 to-blue-600' },
   { id: 'rum', name: 'Rum', nameNe: 'रम', icon: Cherry, color: 'from-red-500 to-red-700' },
   { id: 'gin', name: 'Gin', nameNe: 'जिन', icon: Martini, color: 'from-cyan-400 to-cyan-600' },
   { id: 'tequila', name: 'Tequila', nameNe: 'टकिला', icon: FlameKindling, color: 'from-lime-500 to-lime-700' },
   { id: 'cognac', name: 'Cognac', nameNe: 'कोग्न्याक', icon: Coffee, color: 'from-orange-600 to-orange-800' },
   { id: 'champagne', name: 'Champagne', nameNe: 'शैम्पेन', icon: Sparkles, color: 'from-yellow-400 to-yellow-600' },
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
      
      {/* Mobile: Dropdown */}
      <div className="block md:hidden mb-4">
        <Select
          value={selected === 'All' || selected === '' ? 'all' : selected.toLowerCase()}
          onValueChange={(value) => onSelect(value === 'all' ? 'All' : categories.find(c => c.id === value)?.name || 'All')}
        >
          <SelectTrigger className={`w-full ${
            currentTheme === 'dark'
              ? 'bg-card border-border'
              : 'bg-white border-gray-200'
          }`}>
            <SelectValue placeholder={t('categories')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{language === 'en' ? category.name : category.nameNe}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Responsive Grid: Show on md and above, with better breakpoints */}
      <div className="hidden md:grid grid-cols-4 gap-2 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((category) => {
          const isSelected = selected === category.name || (category.id === 'all' && (selected === 'All' || selected === ''));
          const Icon = category.icon;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id === 'all' ? 'All' : category.name)}
              className={`group flex flex-col items-center gap-1 sm:gap-1.5 rounded-lg border p-2 sm:p-2.5 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `border-flame-orange bg-gradient-to-br ${category.color} shadow-lg shadow-flame-orange/20`
                  : currentTheme === 'dark'
                  ? 'border-border bg-card hover:border-flame-orange/50 hover:shadow-md'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <Icon className={`text-lg sm:text-xl md:text-2xl transition-transform group-hover:scale-110 ${
                isSelected ? 'text-white' : currentTheme === 'dark' ? 'text-flame-orange' : 'text-orange-600'
              }`} />
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
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



