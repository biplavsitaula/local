"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category, CategoryFilter, originTypeMetadata, OriginTypeInfo } from "@/hooks/useCategories";
import { ChevronRight, ChevronDown, Home, Globe, X, LayoutGrid, Filter } from "lucide-react";

interface HierarchicalCategorySelectorProps {
  categories: Category[];
  selectedFilter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
}

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({
  categories,
  selectedFilter,
  onFilterChange,
}) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  
  // States for hover (desktop)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredOriginType, setHoveredOriginType] = useState<string | null>(null);
  
  // States for click/tap (desktop submenu)
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openOriginType, setOpenOriginType] = useState<string | null>(null);
  
  // State for mobile dropdown
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);
  const [mobileExpandedOrigin, setMobileExpandedOrigin] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
        setOpenOriginType(null);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileDropdownOpen(false);
        setMobileExpandedCategory(null);
        setMobileExpandedOrigin(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get origin types for a category - only returns actual data, no defaults
  const getOriginTypes = (category: Category): OriginTypeInfo[] => {
    if (category.originTypes && category.originTypes.length > 0) {
      return category.originTypes;
    }
    return []; // Return empty array if no origin types exist
  };

  // Check if category has imported origin type
  const hasImportedOrigin = (category: Category): boolean => {
    const originTypes = getOriginTypes(category);
    return originTypes.some(o => o.type === "imported");
  };

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (categoryId === "all") {
      onFilterChange({});
      setOpenCategory(null);
      setOpenOriginType(null);
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const originTypes = getOriginTypes(category);
    const hasImported = hasImportedOrigin(category);
    
    // No origin types - just select the category
    if (originTypes.length === 0) {
      onFilterChange({ category: categoryId });
      setOpenCategory(null);
      setOpenOriginType(null);
      return;
    }
    
    // No imported origin type - directly show domestic products
    if (!hasImported) {
      const domesticOrigin = originTypes.find(o => o.type === "domestic");
      if (domesticOrigin) {
        onFilterChange({ category: categoryId, originType: "domestic" });
      } else {
        // Fallback to first origin type if domestic doesn't exist
        onFilterChange({ category: categoryId, originType: originTypes[0].type });
      }
      setOpenCategory(null);
      setOpenOriginType(null);
      return;
    }

    // Has imported origin - show submenu with both options
    if (openCategory === categoryId) {
      // If submenu is already open, clicking again selects just the category
      onFilterChange({ category: categoryId });
      setOpenCategory(null);
      setOpenOriginType(null);
    } else {
      // Open the submenu for this category
      setOpenCategory(categoryId);
      setOpenOriginType(null);
    }
  };

  const handleOriginTypeClick = (categoryId: string, originType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const origin = getOriginTypes(category).find(o => o.type === originType);
    const hasSubCategories = origin?.subCategories && origin.subCategories.length > 0;
    
    if (hasSubCategories && openOriginType !== originType) {
      setOpenOriginType(originType);
    } else {
      onFilterChange({ category: categoryId, originType });
      setOpenCategory(null);
      setOpenOriginType(null);
    }
  };

  const handleSubCategoryClick = (categoryId: string, originType: string, subCategory: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFilterChange({ category: categoryId, originType, subCategory });
    setOpenCategory(null);
    setOpenOriginType(null);
  };

  // Mobile dropdown handlers
  const handleMobileCategorySelect = (categoryId: string) => {
    if (categoryId === "all") {
      onFilterChange({});
      setMobileDropdownOpen(false);
      setMobileExpandedCategory(null);
      setMobileExpandedOrigin(null);
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const originTypes = getOriginTypes(category);
    const hasImported = hasImportedOrigin(category);
    
    // No origin types - just select the category
    if (originTypes.length === 0) {
      onFilterChange({ category: categoryId });
      setMobileDropdownOpen(false);
      setMobileExpandedCategory(null);
      setMobileExpandedOrigin(null);
      return;
    }
    
    // No imported origin type - directly show domestic products
    if (!hasImported) {
      const domesticOrigin = originTypes.find(o => o.type === "domestic");
      if (domesticOrigin) {
        onFilterChange({ category: categoryId, originType: "domestic" });
      } else {
        // Fallback to first origin type if domestic doesn't exist
        onFilterChange({ category: categoryId, originType: originTypes[0].type });
      }
      setMobileDropdownOpen(false);
      setMobileExpandedCategory(null);
      setMobileExpandedOrigin(null);
      return;
    }

    // Has imported origin - expand to show both options
    if (mobileExpandedCategory === categoryId) {
      // Double tap - select just the category
      onFilterChange({ category: categoryId });
      setMobileDropdownOpen(false);
      setMobileExpandedCategory(null);
      setMobileExpandedOrigin(null);
    } else {
      // First tap - expand to show origin types
      setMobileExpandedCategory(categoryId);
      setMobileExpandedOrigin(null);
    }
  };

  const handleMobileOriginSelect = (categoryId: string, originType: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const origin = getOriginTypes(category).find(o => o.type === originType);
    const hasSubCategories = origin?.subCategories && origin.subCategories.length > 0;

    if (hasSubCategories && mobileExpandedOrigin !== originType) {
      setMobileExpandedOrigin(originType);
    } else {
      onFilterChange({ category: categoryId, originType });
      setMobileDropdownOpen(false);
      setMobileExpandedCategory(null);
      setMobileExpandedOrigin(null);
    }
  };

  const handleMobileSubCategorySelect = (categoryId: string, originType: string, subCategory: string) => {
    onFilterChange({ category: categoryId, originType, subCategory });
    setMobileDropdownOpen(false);
    setMobileExpandedCategory(null);
    setMobileExpandedOrigin(null);
  };

  const clearFilter = () => {
    onFilterChange({});
    setOpenCategory(null);
    setOpenOriginType(null);
    setMobileDropdownOpen(false);
    setMobileExpandedCategory(null);
    setMobileExpandedOrigin(null);
  };

  // Get display text for current filter
  const getFilterDisplayText = () => {
    const parts: string[] = [];
    if (selectedFilter.category) {
      const cat = categories.find(c => c.id === selectedFilter.category);
      parts.push(language === "en" ? cat?.name || selectedFilter.category : cat?.nameNe || selectedFilter.category);
    }
    if (selectedFilter.originType) {
      const meta = originTypeMetadata[selectedFilter.originType];
      parts.push(language === "en" ? meta?.label || selectedFilter.originType : meta?.labelNe || selectedFilter.originType);
    }
    if (selectedFilter.subCategory) {
      parts.push(selectedFilter.subCategory.charAt(0).toUpperCase() + selectedFilter.subCategory.slice(1));
    }
    return parts.join(" → ");
  };

  // Get selected category info for mobile button
  const getSelectedCategoryInfo = () => {
    if (selectedFilter.category) {
      const cat = categories.find(c => c.id === selectedFilter.category);
      return {
        name: language === "en" ? cat?.name || selectedFilter.category : cat?.nameNe || selectedFilter.category,
        icon: cat?.icon || LayoutGrid
      };
    }
    return {
      name: language === "en" ? "All Categories" : "सबै श्रेणी",
      icon: LayoutGrid
    };
  };

  // Determine if submenu should show (either via hover on desktop or click)
  const isSubMenuOpen = (categoryId: string) => {
    return hoveredCategory === categoryId || openCategory === categoryId;
  };

  const isOriginSubMenuOpen = (originType: string) => {
    return hoveredOriginType === originType || openOriginType === originType;
  };

  const selectedCatInfo = getSelectedCategoryInfo();
  const SelectedIcon = selectedCatInfo.icon;

  return (
    <div className="w-full">
      {/* Active Filter Display */}
      {(selectedFilter.category || selectedFilter.originType || selectedFilter.subCategory) && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          theme === "dark" ? "bg-secondary/50" : "bg-gray-100"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === "dark" ? "text-muted-foreground" : "text-gray-600"}`}>
              {language === "en" ? "Filter:" : "फिल्टर:"}
            </span>
            <span className={`font-medium ${theme === "dark" ? "text-flame-orange" : "text-orange-600"}`}>
              {getFilterDisplayText()}
            </span>
          </div>
          <button
            onClick={clearFilter}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              theme === "dark" 
                ? "hover:bg-secondary text-muted-foreground hover:text-foreground" 
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Dropdown (visible on small screens) */}
      <div className="sm:hidden relative" ref={mobileDropdownRef}>
        <button
          onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
          className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
            theme === "dark"
              ? "bg-secondary/50 hover:bg-secondary text-foreground border border-border"
              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{language === "en" ? "Browse by Category" : "श्रेणी द्वारा हेर्नुहोस्"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === "dark" ? "text-flame-orange" : "text-orange-600"}`}>
              {selectedCatInfo.name}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileDropdownOpen && (
          <div className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-xl shadow-xl border max-h-[60vh] overflow-y-auto ${
            theme === "dark"
              ? "bg-card border-border"
              : "bg-white border-gray-200"
          }`}>
            {categories.map((category, catIdx) => {
              const IconComponent = category.icon;
              const isSelected = selectedFilter.category === category.id || 
                (category.id === "all" && !selectedFilter.category);
              const isExpanded = mobileExpandedCategory === category.id;
              const originTypes = getOriginTypes(category);
              // Only show submenu chevron if there's an imported origin type
              const showSubmenuIndicator = category.id !== "all" && hasImportedOrigin(category);

              return (
                <div key={category.id}>
                  <button
                    onClick={() => handleMobileCategorySelect(category.id)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? theme === "dark"
                          ? "bg-flame-orange/20 text-flame-orange"
                          : "bg-orange-50 text-orange-600"
                        : theme === "dark"
                        ? "hover:bg-secondary text-foreground"
                        : "hover:bg-gray-50 text-gray-700"
                    } ${catIdx === 0 ? "rounded-t-xl" : ""} ${
                      catIdx === categories.length - 1 && !isExpanded ? "rounded-b-xl" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">
                        {language === "en" ? category.name : category.nameNe}
                      </span>
                    </div>
                    {showSubmenuIndicator && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Origin Types (nested) - Only show if imported origin exists */}
                  {hasImportedOrigin(category) && isExpanded && (
                    <div className={`${theme === "dark" ? "bg-secondary/30" : "bg-gray-50"}`}>
                      {originTypes.map((origin) => {
                        const OriginIcon = origin.type === "domestic" ? Home : Globe;
                        const hasSubCategories = origin.subCategories && origin.subCategories.length > 0;
                        const isOriginExpanded = mobileExpandedOrigin === origin.type;

                        return (
                          <div key={origin.type}>
                            <button
                              onClick={() => handleMobileOriginSelect(category.id, origin.type)}
                              className={`w-full flex items-center justify-between gap-2 px-6 py-2.5 text-left transition-colors cursor-pointer ${
                                selectedFilter.originType === origin.type && selectedFilter.category === category.id
                                  ? theme === "dark"
                                    ? "bg-flame-orange/10 text-flame-orange"
                                    : "bg-orange-100 text-orange-600"
                                  : theme === "dark"
                                  ? "hover:bg-secondary/50 text-foreground"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <OriginIcon className="w-4 h-4" />
                                <span className="text-sm">
                                  {language === "en" ? origin.label : origin.labelNe}
                                </span>
                              </div>
                              {hasSubCategories && (
                                <ChevronDown className={`w-3 h-3 transition-transform ${isOriginExpanded ? 'rotate-180' : ''}`} />
                              )}
                            </button>

                            {/* SubCategories (nested) */}
                            {hasSubCategories && isOriginExpanded && (
                              <div className={`${theme === "dark" ? "bg-secondary/50" : "bg-gray-100"}`}>
                                {origin.subCategories.map((subCat) => (
                                  <button
                                    key={subCat.name}
                                    onClick={() => handleMobileSubCategorySelect(category.id, origin.type, subCat.name)}
                                    className={`w-full px-8 py-2 text-left text-sm transition-colors cursor-pointer ${
                                      selectedFilter.subCategory === subCat.name
                                        ? theme === "dark"
                                          ? "text-flame-orange"
                                          : "text-orange-600"
                                        : theme === "dark"
                                        ? "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                        : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                                    }`}
                                  >
                                    • {subCat.name.charAt(0).toUpperCase() + subCat.name.slice(1)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Category Grid (hidden on small screens) */}
      <div className="hidden sm:flex flex-wrap gap-3" ref={containerRef}>
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedFilter.category === category.id || 
            (category.id === "all" && !selectedFilter.category);
          const originTypes = getOriginTypes(category);
          // Only show submenu if imported origin exists
          const hasSubmenu = category.id !== "all" && hasImportedOrigin(category);
          const subMenuVisible = hasSubmenu && isSubMenuOpen(category.id);

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => hasSubmenu && setHoveredCategory(category.id)}
              onMouseLeave={() => {
                setHoveredCategory(null);
                setHoveredOriginType(null);
              }}
            >
              {/* Category Button */}
              <button
                onClick={(e) => handleCategoryClick(category.id, e)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : theme === "dark"
                    ? "bg-secondary/50 hover:bg-secondary text-foreground border border-border hover:border-flame-orange/50"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 shadow-sm"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-base font-medium">
                  {language === "en" ? category.name : category.nameNe}
                </span>
                {hasSubmenu && (
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${subMenuVisible ? 'rotate-90' : ''}`} />
                )}
              </button>

              {/* Origin Type Submenu - Only show if imported origin exists */}
              {subMenuVisible && (
                <div
                  className={`absolute left-0 top-full mt-1 z-50 min-w-[160px] w-max max-w-[250px] rounded-xl shadow-xl border ${
                    theme === "dark"
                      ? "bg-card border-border"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {originTypes.map((origin, originIdx) => {
                    const OriginIcon = origin.type === "domestic" ? Home : Globe;
                    const hasSubCategories = origin.subCategories && origin.subCategories.length > 0;
                    const originSubMenuVisible = isOriginSubMenuOpen(origin.type);

                    return (
                      <div
                        key={origin.type}
                        className="relative"
                        onMouseEnter={() => setHoveredOriginType(origin.type)}
                        onMouseLeave={() => setHoveredOriginType(null)}
                      >
                        <button
                          onClick={(e) => handleOriginTypeClick(category.id, origin.type, e)}
                          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            selectedFilter.originType === origin.type && selectedFilter.category === category.id
                              ? theme === "dark"
                                ? "bg-flame-orange/20 text-flame-orange"
                                : "bg-orange-50 text-orange-600"
                              : theme === "dark"
                              ? "hover:bg-secondary text-foreground"
                              : "hover:bg-gray-50 text-gray-700"
                          } ${originIdx === 0 ? "rounded-t-xl" : ""} ${
                            originIdx === originTypes.length - 1 ? "rounded-b-xl" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <OriginIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {language === "en" ? origin.label : origin.labelNe}
                            </span>
                          </div>
                          {hasSubCategories && (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {/* SubCategory Submenu */}
                        {hasSubCategories && originSubMenuVisible && (
                          <div
                            className={`absolute left-full top-0 ml-1 z-50 min-w-[180px] rounded-xl shadow-xl border ${
                              theme === "dark"
                                ? "bg-card border-border"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            {origin.subCategories.map((subCat, idx) => (
                              <button
                                key={subCat.name}
                                onClick={(e) => handleSubCategoryClick(category.id, origin.type, subCat.name, e)}
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                                  selectedFilter.subCategory === subCat.name
                                    ? theme === "dark"
                                      ? "bg-flame-orange/20 text-flame-orange"
                                      : "bg-orange-50 text-orange-600"
                                    : theme === "dark"
                                    ? "hover:bg-secondary text-foreground"
                                    : "hover:bg-gray-50 text-gray-700"
                                } ${idx === 0 ? "rounded-t-xl" : ""} ${
                                  idx === origin.subCategories.length - 1 ? "rounded-b-xl" : ""
                                }`}
                              >
                                {subCat.name.charAt(0).toUpperCase() + subCat.name.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HierarchicalCategorySelector;

