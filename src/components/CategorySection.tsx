"use client";


import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, LayoutGrid, Sparkles, Coffee, FlameKindling } from 'lucide-react';
import { ICategorySectionProps } from '@/interface/ICategorySectionProps';


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
       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
         {categories.map((category) => {
           const isSelected = selected === category.name || (category.id === 'all' && (selected === 'All' || selected === ''));
           const Icon = category.icon;
          
           return (
             <button
               key={category.id}
               onClick={() => onSelect(category.id === 'all' ? 'All' : category.name)}
               className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-300 cursor-pointer ${
                 isSelected
                   ? `border-flame-orange bg-gradient-to-br ${category.color} shadow-lg shadow-flame-orange/20`
                   : currentTheme === 'dark'
                   ? 'border-border bg-card hover:border-flame-orange/50 hover:shadow-md'
                   : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
               }`}
             >
               <Icon className={`text-2xl transition-transform group-hover:scale-110 ${
                 isSelected ? 'text-white' : currentTheme === 'dark' ? 'text-flame-orange' : 'text-orange-600'
               }`} />
               <span className={`text-xs font-medium text-center ${
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



