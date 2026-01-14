"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LayoutGrid, LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  nameNe: string;
  icon: LucideIcon;
  color: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = "",
}) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const currentTheme = theme;

  return (
    <>
      {/* Categories Grid - Desktop */}
      <div className={`hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 ${className}`}>
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(isSelected ? null : category.id)}
              className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105`
                  : currentTheme === 'dark'
                    ? 'bg-card hover:bg-card/80 border border-border hover:border-flame-orange/50'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-300 shadow-sm'
              }`}
            >
              <div className={`flex flex-col items-center gap-3 ${
                isSelected ? '' : currentTheme === 'dark' ? 'text-foreground' : 'text-gray-700'
              }`}>
                <div className={`p-3 rounded-xl ${
                  isSelected 
                    ? 'bg-white/20' 
                    : currentTheme === 'dark'
                      ? 'bg-secondary'
                      : 'bg-orange-50'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    isSelected ? 'text-white' : 'text-flame-orange'
                  }`} />
                </div>
                <span className="font-medium text-sm">
                  {language === "en" ? category.name : category.nameNe}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Categories Dropdown - Mobile */}
      <div className={`md:hidden mb-8 ${className}`}>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => onCategorySelect(value === "all" ? null : value)}
        >
          <SelectTrigger className={`w-full ${
            currentTheme === 'dark'
              ? 'bg-card border-border text-foreground'
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent className={currentTheme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'}>
            <SelectItem value="all" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-flame-orange" />
                <span>{t("allCategories")}</span>
              </div>
            </SelectItem>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-flame-orange" />
                    <span>{language === "en" ? category.name : category.nameNe}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CategorySelector;

