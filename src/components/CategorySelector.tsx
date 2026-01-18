"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LayoutGrid, LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Horizontal Scrollable Categories - All Screens */}
      <div className={`relative mb-8 ${className}`}>
        {/* Left Fade & Arrow */}
        {showLeftArrow && (
          <>
            <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none ${
              currentTheme === 'dark' 
                ? 'bg-gradient-to-r from-background to-transparent' 
                : 'bg-gradient-to-r from-gray-50 to-transparent'
            }`} />
            <button
              onClick={() => scroll('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                currentTheme === 'dark'
                  ? 'bg-card border border-border text-foreground hover:bg-secondary'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = category.id === 'all' 
              ? selectedCategory === null || selectedCategory === 'all'
              : selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => {
                  if (category.id === 'all') {
                    onCategorySelect(null);
                  } else {
                    onCategorySelect(isSelected ? null : category.id);
                  }
                }}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                  transition-all duration-300 cursor-pointer flex-shrink-0
                  ${isSelected
                    ? 'bg-gradient-to-r from-flame-orange to-flame-red text-white shadow-md shadow-flame-orange/25'
                    : currentTheme === 'dark'
                      ? 'bg-card/80 border border-border/50 text-foreground hover:border-flame-orange/50 hover:bg-card'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:shadow-sm'
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  isSelected ? 'text-white' : 'text-flame-orange'
                }`} />
                <span className="font-medium text-sm">
                  {language === "en" ? category.name : category.nameNe}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Fade & Arrow */}
        {showRightArrow && (
          <>
            <div className={`absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none ${
              currentTheme === 'dark' 
                ? 'bg-gradient-to-l from-background to-transparent' 
                : 'bg-gradient-to-l from-gray-50 to-transparent'
            }`} />
            <button
              onClick={() => scroll('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                currentTheme === 'dark'
                  ? 'bg-card border border-border text-foreground hover:bg-secondary'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Dropdown Alternative (Optional - can be enabled if preferred) */}
      <div className={`hidden mb-8 ${className}`}>
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
          <SelectContent 
            side="bottom"
            position="popper"
            className={`max-h-[300px] ${currentTheme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'}`}
          >
            <SelectItem value="all" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-flame-orange" />
                <span>{t("allCategories")}</span>
              </div>
            </SelectItem>
            {categories
              .filter((category) => category.id !== 'all')
              .map((category) => {
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


