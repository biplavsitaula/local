import { ThumbsUp } from 'lucide-react';

interface RecommendedProductsCardProps {
  delay?: number;
}

export function RecommendedProductsCard({ delay = 0 }: RecommendedProductsCardProps) {
  const products = [
    { name: 'Royal Stag Premium', rating: 4.8 },
    { name: 'Johnnie Walker Black', rating: 4.9 },
    { name: 'Absolut Original', rating: 4.7 },
  ];

  return (
    <div 
      className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ThumbsUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Recommended Products</h3>
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-foreground font-medium">{product.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-primary">{product.rating}</span>
              <span className="text-xs text-muted-foreground">★</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

