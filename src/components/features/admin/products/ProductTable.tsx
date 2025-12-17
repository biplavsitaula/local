import { useMemo } from 'react';
import { products } from '@/data/products';
import { Product } from '@/types';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';

interface ProductTableProps {
  filter: FilterType;
}

export function ProductTable({ filter }: ProductTableProps) {
  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [...products];

    switch (filter) {
      case 'out-of-stock':
        filtered = products.filter((p) => !p.stock || p.stock === 0);
        break;
      case 'low-stock':
        filtered = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 20);
        break;
      case 'top-sellers':
        // Sort by price (assuming higher price = more popular) or by stock movement
        filtered = [...products].sort((a, b) => b.price - a.price).slice(0, 10);
        break;
      case 'top-reviewed':
        // Sort by rating if available, otherwise by price
        filtered = [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .filter((p) => p.rating && p.rating > 0)
          .slice(0, 10);
        break;
      case 'recommended':
        // Products with tags or high ratings
        filtered = products
          .filter((p) => p.tag || (p.rating && p.rating >= 4))
          .slice(0, 10);
        break;
      case 'all':
      default:
        filtered = products;
        break;
    }

    return filtered;
  }, [filter]);

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-sm font-semibold text-foreground">Product</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Category</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Price</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Stock</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground">{product.name}</td>
                  <td className="p-4 text-sm text-muted-foreground capitalize">{product.category}</td>
                  <td className="p-4 text-sm text-foreground">Rs. {product.price.toLocaleString()}</td>
                  <td className="p-4 text-sm text-foreground">{product.stock || 0}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (product.stock || 0) > 20 
                        ? 'bg-success/20 text-success' 
                        : (product.stock || 0) > 0 
                        ? 'bg-warning/20 text-warning' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {(product.stock || 0) > 20 ? 'In Stock' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

