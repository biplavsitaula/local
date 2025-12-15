import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/products';
import { ArrowRight } from 'lucide-react';

interface CategorySectionProps {
  selected: string;
  onSelect: (value: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ selected, onSelect }) => {
  const { language, t } = useLanguage();

  const categoryImages: Record<string, string> = {
    All: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop',
    Whiskey: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop',
    Vodka: 'https://images.unsplash.com/photo-1614963366795-973eb8748ade?w=400&h=300&fit=crop',
    Rum: 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=400&h=300&fit=crop',
    Wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    Beer: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
    Brandy: 'https://images.unsplash.com/photo-1569078449082-a79eec46a9ea?w=400&h=300&fit=crop',
    Gin: 'https://images.unsplash.com/photo-1631939046872-79ef3d41d1f1?w=400&h=300&fit=crop',
    Tequila: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=300&fit=crop',
    Cider: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
    Liqueur: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?w=400&h=300&fit=crop',
  };

  const categoryIcons: Record<string, string> = {
    All: '🍷',
    Whiskey: '🥃',
    Gin: '🍸',
    Rum: '🍹',
    Beer: '🍺',
    Wine: '🍷',
    Tequila: '🍾',
    Cider: '🍎',
    Liqueur: '🥂',
  };

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t('categories')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive collection by category
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const isSelected = selected === category.name;
            const categoryKey = category.name.toLowerCase();
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.name)}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] animate-fade-in card-glow transition-all ${
                  isSelected ? 'ring-2 ring-flame-orange' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Image */}
                <img
                  src={categoryImages[category.name] || categoryImages['All']}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent ${
                  isSelected ? 'from-flame-orange/20' : ''
                }`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  <span className="text-4xl mb-2">{categoryIcons[category.name] || '🍷'}</span>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                    {language === 'en' ? category.name : category.nameNe}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-flame-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
