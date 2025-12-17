interface TopProductsCardProps {
  type: 'sales' | 'reviews';
  delay?: number;
}

export function TopProductsCard({ type, delay = 0 }: TopProductsCardProps) {
  const products = [
    { name: 'Royal Stag Premium', value: type === 'sales' ? '1,240' : '4.8' },
    { name: 'Johnnie Walker Black', value: type === 'sales' ? '980' : '4.9' },
    { name: 'Absolute Original', value: type === 'sales' ? '850' : '4.7' },
  ];

  return (
    <div 
      className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Top Products by {type === 'sales' ? 'Sales' : 'Reviews'}
      </h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-foreground font-medium">{product.name}</span>
            <span className="text-sm font-semibold text-primary">{product.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

